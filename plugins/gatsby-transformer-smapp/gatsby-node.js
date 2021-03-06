const csv = require(`csvtojson`)
const _ = require(`lodash`)
const crypto = require(`crypto`)

const convertToJson = (data, options) =>
  new Promise((res, rej) => {
    csv(options)
      .fromString(data)
      .on(`end_parsed`, jsonData => {
        if (!jsonData) {
          rej(`CSV to JSON conversion failed!`)
        }

        jsonData = jsonData.map(row => {
          Object.keys(row).forEach(key => {
            const camelCased = _.camelCase(key)
            if (camelCased != key) {
              row[camelCased] = row[key]
              delete(row[key])
            }
          })
          return row
        })

        res(jsonData)
      })
  })

async function onCreateNode(
  { node, boundActionCreators, loadNodeContent },
  options
) {
  const { createNode, createParentChildLink } = boundActionCreators
  // Filter out non-csv content
  if (node.extension !== `smapp`) {
    return
  }
  // Load CSV contents
  const content = await loadNodeContent(node)
  // Parse
  let parsedContent = await convertToJson(content, options)

  if (_.isArray(parsedContent)) {
    const csvArray = parsedContent.map((obj, i) => {
      const objStr = JSON.stringify(obj)
      const contentDigest = crypto
        .createHash(`md5`)
        .update(objStr)
        .digest(`hex`)

      return {
        ...obj,
        name: node.name,
        id: obj.id ? obj.id : `${node.id} [${i}] >>> CSV`,
        children: [],
        parent: node.id,
        internal: {
          contentDigest,
          // TODO make choosing the "type" a lot smarter. This assumes
          // the parent node is a file.
          // PascalCase
          type: _.upperFirst(_.camelCase(`${node.internal.type} Csv`)),
        },
      }
    })

    _.each(csvArray, y => {
      createNode(y)
      createParentChildLink({ parent: node, child: y })
    })
  }

  return
}

exports.onCreateNode = onCreateNode
