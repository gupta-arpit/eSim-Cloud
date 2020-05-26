/* eslint-disable*/
import mxGraphFactory from 'mxgraph'

const {
  mxConstants
} = new mxGraphFactory()

let pinData, metadata, pinList, pinName, pinOrientation, pinLength
let currentPin, x_pos, y_pos
let width, height

// we need to divide the svg width and height by the same number in order to maintain the aspect ratio.
const fixed_number = 5

function extractData(xml) {
  pinData = []
  metadata = xml.getElementsByTagName('metadata')
  const width = metadata[0].attributes[0].nodeValue
  const height = metadata[0].attributes[1].nodeValue

  pinList = metadata[0].childNodes
  // console.log(metadata)
  // console.log(xmlDoc)
  // console.log(width,height)
  pinList.forEach(function (pin) {
    const pinNumber = pin.tagName.split('-').pop()
    const pinX = pin.getElementsByTagName('x')[0].innerHTML
    const pinY = pin.getElementsByTagName('y')[0].innerHTML
    const pinType = pin.getElementsByTagName('type')[0].innerHTML.trim()
    const pinName = pin.getElementsByTagName('name')[0].innerHTML.trim()
    const pinOrientation = pin.getElementsByTagName('orientation')[0].innerHTML.trim()
    const pinLength = pin.getElementsByTagName('length')[0].innerHTML.trim()


    pinData.push({
      pinNumber: pinNumber, pinX: pinX, pinY: pinY, type: pinType, pinName: pinName,
      pinOrientation: pinOrientation, pinLength: pinLength
    })
    // console.log(pinNumber, pinX, pinY, pinType)
  })
  return {
    width: width,
    height: height,
    pinData: pinData
  }
}

function getMetadataXML(path, graph, parent, evt, target, x, y) {
  fetch(path)
    .then(function (response) {
      return response.text()
    })
    .then(function (data) {
      const parser = new DOMParser()
      const xml = parser.parseFromString(data, 'text/xml')
      // console.log(xmlDoc);
      data = extractData(xml)
      // console.log(data)
      return data
    }).then(function (data) {
      // MX GRAPHS TRY BLOCK HAS BEEN SHIFTED HERE.
      const pins = []
      width = data.width
      height = data.height
      pinData = data.pinData


      // console.log(pinData)

      // Enables moving of vertex labels
      graph.vertexLabelsMovable = true

      // Creates a style with an indicator
      var style = graph.getStylesheet().getDefaultVertexStyle()

      style[mxConstants.STYLE_SHAPE] = 'label'
      style[mxConstants.STYLE_VERTICAL_ALIGN] = 'bottom'
      // style[mxConstants.STYLE_INDICATOR_SHAPE] = 'ellipse'
      // style[mxConstants.STYLE_INDICATOR_WIDTH] = 34
      // style[mxConstants.STYLE_INDICATOR_HEIGHT] = 34
      style[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = 'bottom' // indicator v-alignment
      style[mxConstants.STYLE_IMAGE_ALIGN] = 'bottom'
      style[mxConstants.STYLE_INDICATOR_COLOR] = 'green'
      style[mxConstants.STYLE_FONTCOLOR] = 'red'
      style[mxConstants.STYLE_FONTSIZE] = '10'
      delete style[mxConstants.STYLE_STROKECOLOR] // transparent
      // delete style[mxConstants.STYLE_FILLCOLOR] // transparent

      console.log(width,height)
      if(width <=  200 && height <= 200){
        width = width / 2.5
        height = height / 2.5
      }
      else{
        width = width / fixed_number
        height = height / fixed_number

      }

      const v1 = graph.insertVertex(
        parent,
        null,
        '',
        x,
        y,
        width,
        height,
        'shape=image;image=' + path + ';'
      )
      v1.Component = true
      var newsource = path
      var prefix = newsource.split('/')
      var symboltype = prefix[3].split('')
      v1.CellType = 'Component'
      v1.symbol = symboltype[0]
      v1.setConnectable(false)
      for (let i = 0; i < pinData.length; i++) {
        currentPin = pinData[i]

        // move this to another file

        x_pos = (parseInt(width) / 2 + parseInt(currentPin.pinX) / fixed_number)
        y_pos = (parseInt(height) / 2 - parseInt(currentPin.pinY) / fixed_number)

        // move this to another file
        // eslint-disable-next-line
        if (currentPin.pinOrientation === "L") {
          pins[i] = graph.insertVertex(v1, null, currentPin.pinNumber, x_pos, y_pos, 0.5, 0.5, 'align=right;verticalAlign=bottom;rotation=0')
        } else if (currentPin.pinOrientation === 'R') {
          pins[i] = graph.insertVertex(v1, null, currentPin.pinNumber, x_pos, y_pos, 0.5, 0,5, 'align=left;verticalAlign=bottom;rotation=0')
        } else if (currentPin.pinOrientation === 'U') {
          pins[i] = graph.insertVertex(v1, null, currentPin.pinNumber, x_pos, y_pos, 0.5, 0.5, 'align=right;verticalAlign=bottom;rotation=0')
        } else {
          pins[i] = graph.insertVertex(v1, null, currentPin.pinNumber, x_pos, y_pos, 0.5, 0.5, 'align=right;verticalAlign=up;rotation=0')
        }
        pins[i].geometry.relative = false
        pins[i].Pin = true
        if (currentPin.type === 'I') {
          pins[i].pinType = 'Input'
        } else {
          pins[i].pinType = 'Output'
        }
        // pins[i].pinType = currentPin['type']
        pins[i].ParentComponent = v1
        pins[i].PinNumber = currentPin.pinNumber
        if( currentPin.pinName !== null) {
          pins[i].PinName = currentPin.pinName
        }
      }
    })
}

export default getMetadataXML