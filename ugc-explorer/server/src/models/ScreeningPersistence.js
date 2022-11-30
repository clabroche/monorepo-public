const { models } = require("@clabroche-org/ugc-explorer-models")
const { Screening } = models
const cheerio = require('cheerio');
const axios = require('axios').default.create({
  baseURL: 'https://www.ugc.fr'
})
const dayjs = require('dayjs')

class ScreeningPersistence extends Screening {
  /** @param {import('@clabroche-org/common-typings').NonFunctionProperties<ScreeningPersistence>} screening */
  constructor(screening) {
    super(screening)
  }
  static async all(date = dayjs(), search = '') {
    const dateToSearch = dayjs(date).format('DD/MM/YYYY')
    const { data: html } = await axios.get('/showingsCinemaAjaxAction!getShowingsForCinemaPage.action', {
      params: {
        cinemaId: 29,
        date: dateToSearch,
        page: 30007,
        searchFilmKey: search,
      }
    })
    const $html = cheerio.load(html)
    return [...$html('.component--cinema-list-item')].map((element) => {
      const $film = cheerio.load(element)
      const allInfos = [...$film('.component--film-presentation .info-wrapper .group-info p')]
        .map(i => cheerio.load(i).text().trim())
      let out = allInfos.filter(f => f.startsWith('Sortie le')).pop()?.replace('Sortie le', '').trim().split('   ')[0].split('(')[0].trim()
      let categories = allInfos.filter(f => f?.includes('('))[0]?.split('(')[0].trim().split(',').map(a => a.trim())
      let realisators = allInfos.filter(f => f.startsWith('De'))[0]?.split('       ').pop()?.replace('De', '').trim().split(',').map(a => a.trim())
      let actors = allInfos.filter(f => f.startsWith('Avec'))[0]?.replace('Avec', '').trim().split(',').map(a => a.trim())
      let resume = allInfos.filter(f => f.startsWith('Synopsis'))[0]?.replace('Synopsis', '').replace('voir plus', '').trim()
      let cover = $film('img')[0]?.attribs?.['data-src']?.trim()
      let external = $film('.visu-wrapper a')[0]?.attribs?.['href']
      return {
        title: $film('.component--film-presentation .block--title').text().trim(),
        out,
        external: external ? `${axios.defaults.baseURL}/${external}`: '',
        realisators,
        categories,
        actors,
        cover,
        resume,
        screenings: [...$film('.screening-date-wrapper')].map((screeningWrapper) => {
          const version = cheerio.load(screeningWrapper.parent)('.screening-lang').text().trim()
          return {
            start: cheerio.load(screeningWrapper)('.screening-start').text().trim(),
            end: cheerio.load(screeningWrapper)('.screening-end').text().trim().split(' ')[1].split(')')[0],
            version: version,
          }
        }),
      }
    }).filter(screening => screening?.screenings?.length).map(screening => new ScreeningPersistence(screening))
  }
}
module.exports = ScreeningPersistence