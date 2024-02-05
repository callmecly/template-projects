const fs = require('fs');
const handlerBars = require('handlebars')
const { getRelativePath } = require('./utils')

/**
 * 
 * @param {*} source 源数据
 * @param {*} filePath 目标文件
 * @param {*} templatePath 模板文件
 */
module.exports = (source, filePath, templatePath) => {
    if(fs.existsSync(templatePath)) {
        const content = fs.readFileSync(templatePath).toString();
        const result = handlerBars.compile(content)(source)
        fs.writeFileSync(filePath, result)
        const outputPath = getRelativePath(filePath);
        console.log(`✅ ${outputPath} 创建成功`)
    }
}