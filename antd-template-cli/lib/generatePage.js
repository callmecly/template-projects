const fs = require('fs')
const path = require('path')
const compile = require('./compile')
const { dirExists } = require('./fsExtend')
const { camelToHyphenate, getRelativePath } = require('./utils')

/**
 * 插入路由内容
 * @param {*} pageName 
 * @param {*} fatherRoutePath 
 * @param {*} isRedirect 
 */
const addRoute = (pageName, fatherRoutePath, isRedirect, moduleDir) => {
    // 1.读取路由文件；2.找到文本插入的位置；3.插入文本；4.写入文件
    const isNeedId = pageName.includes('detail') || pageName.includes('edit')
    const routePath = `${camelToHyphenate(fatherRoutePath)}/${camelToHyphenate(pageName)}${isNeedId ? '/:id' : ''}`
    const routesString = fs.readFileSync(`${moduleDir}/routes.ts`).toString(); // 读取路由文件
    let addPosition = -1; // 插入的位置
    const tabNum = (fatherRoutePath.split('/').length-1)*2+1;
    let content = `${'\t'.repeat(tabNum)}{\n${'\t'.repeat(tabNum+1)}path: '${routePath}',\n${'\t'.repeat(tabNum+1)}component: () => import('./${pageName}'),\n${'\t'.repeat(tabNum+1)}routes: [\n\n${'\t'.repeat(tabNum+1)}]\n${'\t'.repeat(tabNum)}},`; // 插入的内容
    const pathIndex = routesString.indexOf(camelToHyphenate(fatherRoutePath));
    const routesStr = routesString.substr(pathIndex);
    const routesIndex = routesStr.indexOf('routes: ');
    const rightRoutesString = routesStr.substr(routesIndex)
    let count = 0;
    let lastRoutesIndex = -1;
    if(routesIndex === -1) { // 没有routes不符合预定的格式
        return;
    }
    for(let i = 0, len = rightRoutesString.length; i < len; i++) {
        if(rightRoutesString.charAt(i) === '[') {
            count += 1;
        } else if(rightRoutesString.charAt(i) === ']') {
            count -= 1;
            if(count === 0) {
                lastRoutesIndex = i;
                break;
            }
        }
    }
    const exactRouteStr = rightRoutesString.substring(0, lastRoutesIndex+1)
    const hasRedirectTo = exactRouteStr.substr(exactRouteStr.lastIndexOf('{')).includes('redirectTo');
    if(hasRedirectTo) {
        addPosition = exactRouteStr.substr(0, exactRouteStr.lastIndexOf('{')).lastIndexOf(',') + pathIndex + routesIndex;
        content = `\n${content}`
    } else {
        let lastIndex = exactRouteStr.lastIndexOf(',');
        if(lastIndex === -1) { // 以防止还没添加过子路由
            lastIndex = 'routes: ['.length;
        } else {
            content = `\n${content}`
        }
        addPosition = lastIndex + pathIndex + routesIndex;
    }
    if(isRedirect) {
        content = `${content}\n${'\t'.repeat(tabNum)}{\n${'\t'.repeat(tabNum+1)}path: '',\n${'\t'.repeat(tabNum+1)}redirectTo: '${routePath}',\n${'\t'.repeat(tabNum)}},\n`
    }
    const newRoutesString = routesString.substring(0, addPosition + 1) + content + routesString.substring(addPosition + 1);
    fs.writeFileSync(`${moduleDir}/routes.ts`, newRoutesString)
}

module.exports = async (name, cmd) => {
    const cwd = process.cwd();
    const moduleDir = path.join(cwd, cmd.path ? cmd.path : '');
    const pageDir = path.join(moduleDir, `${name}`)
    const moduleName = path.parse(moduleDir).name; // 父级文件夹名，module名称
    const firstAlphabetOfModuleName = moduleName.charAt(0).toUpperCase();
    const subStrOfModuleName = moduleName.substr(1);
    
    const firstAlphabet = name.charAt(0).toUpperCase();
    const subStr = name.substr(1);
    const componentName = `${firstAlphabetOfModuleName}${subStrOfModuleName}${firstAlphabet}${subStr}`
    const className = `${camelToHyphenate(moduleName)}-${camelToHyphenate(name)}`
    

    const isExists = await dirExists(pageDir);
    if(isExists === true) {
        console.error('❌ 该页面已存在')
        return;
    }
    
    compile({componentName, className, pageName: name }, `${pageDir}/index.tsx`, `${path.join(path.resolve(__dirname, '..'), 'template', 'pageIndex.tsx.hbs' )}`)
    compile({ className }, `${pageDir}/index.less`, `${path.join(path.resolve(__dirname, '..'), 'template', 'index.less.hbs' )}`)
    fs.writeFileSync(`${pageDir}/type.ts`, '// This is type file');
    console.log(`✅ ${getRelativePath(pageDir)}/type.ts 创建成功`)
    compile({ componentName, className,  }, `${pageDir}/index.test.tsx`, `${path.join(path.resolve(__dirname, '..'), 'template', 'index.test.tsx.hbs' )}`)
    compile({componentName}, `${pageDir}/service.ts`, `${path.join(path.resolve(__dirname, '..'), 'template', 'service.ts.hbs' )}`)
    try {
        addRoute(name, cmd.father ? cmd.father : `/${moduleName}`, cmd.redirect, moduleDir);
    } catch (e) {
        console.warn(e.message)
    }
}