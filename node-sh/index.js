import axios from 'axios'
import _ from 'lodash'
import request from 'request'

import fs from 'fs'
import util from 'util'

var logPath = 'upgrade1.log'
var logFile = fs.createWriteStream(logPath, {flags: 'a'})

console.log = function () {
  logFile.write(util.format.apply(null, arguments) + '\n')
  process.stdout.write(util.format.apply(null, arguments) + '\n')
}

console.error = function () {
  logFile.write(util.format.apply(null, arguments) + '\n')
  process.stderr.write(util.format.apply(null, arguments) + '\n')
}

class AsyncPool {
  MAX_CONCURRENCY = 20
  lock = []
  currentConcurrency = 0

  async handleTask(task) {
    if (this.currentConcurrency >= this.MAX_CONCURRENCY) {
      new Promise((resolve, reject) => {
        this.lock.push(resolve)
      }).then(() => {
        task().then(() => {
          this.currentConcurrency--
          console.log('剩余执行的有', this.currentConcurrency)
          this.doNext()
        })
      })
    } else {
      this.currentConcurrency++
      console.log('直接执行：正在执行的有', this.currentConcurrency)
      task().then(() => {
        this.currentConcurrency--
        console.log('剩余执行的有', this.currentConcurrency)
        this.doNext()
      })
    }
  }

  async doNext() {
    if (this.lock.length) {
      this.currentConcurrency++
      console.log('间接执行：正在执行的有', this.currentConcurrency)
      this.lock.shift()()
    }
  }
}

class WorkShell {
  host = 'https://xxx'
  loginUrl = 'https://xxx'
  cookie = ''
  csrfCookie = ''
  _csrf = ''
  page = 1
  pageSize = 20
  tenantCode = ''
  userName = ''
  password = ''
  asyncPool = new AsyncPool()

  async main() {
    this.getCsrfAndCsrfCookie(({_csrf, csrfCookie}) => {
      this._csrf = _csrf
      this.csrfCookie = csrfCookie
      this.getCookie(async () => {
        try {
          await this.run()
        } catch (error) {
          console.log('bug', error)
        }
      })
    })
  }

  getCsrfAndCsrfCookie(callback) {
    var options = {
      method: 'GET',
      url: this.loginUrl,
    }

    request(options, (error, response, body) => {
      const csrfCookie = response.headers['set-cookie']
        .map((item) => {
          return item.split(';')[0]
        })
        .join(';')
      const _csrf = response.body.match(/1111/)[1]

      callback({
        _csrf,
        csrfCookie,
      })
    })
  }

  async getCookie(callback) {
    var options = {
      method: 'POST',
      url: this.loginUrl,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      form: {
        tenantCode: this.tenantCode,
        userName: this.userName,
        password: this.password,
        _csrf: this._csrf,
        code: '',
      },
      headers: {
        Cookie: this.csrfCookie,
      },
    }

    request(options, (error, response, body) => {
      this.cookie = response.headers['set-cookie']
        .map((item) => {
          return item.split(';')[0]
        })
        .join(';')
      console.log('登录成功', this.cookie)
      callback()
    })
  }

  async run() {
    try {
      const projectData = await this.getProjectData()
      for (const projectItem of projectData.data.data.lists) {
        if (_.isEmpty(projectItem.children)) {
          this.asyncPool.handleTask(async () => {
            await this.sortFunction(projectItem)
          })
        } else {
          for (const projectChildrenItem of projectItem.children) {
            this.asyncPool.handleTask(async () => {
              await this.sortFunction(projectChildrenItem)
            })
          }
        }
      }

        console.log('第' + (this.page + 1) + '页')
        if (projectData.data.data.lists.length === this.pageSize) {
          this.page = this.page + 1
          await this.run()
        }
    } catch (error) {
      console.log('run bug', error)
    }
  }

  async getProjectData() {
    try {
      const projectData = await axios({
        method: 'GET',
        params: {
          page: this.page,
          pageSize: this.pageSize,
          keyword: '',
          corpId: '',
          hasChildCompany: false,
        },
        url: this.host + '/',
        headers: {
          'Content-Type': 'application/json',
          Cookie: this.cookie,
        },
      })

      return projectData
    } catch (error) {
      console.log('getProjectData bug', error)
    }
  }

  async getBuildFloorData(projectItem, type) {
    try {
      const buildFloorData = await axios({
        method: 'GET',
        params: {
          id: projectItem.id || projectItem.item_id,
          type,
        },
        url: this.host + '',
        headers: {
          'Content-Type': 'application/json',
          Cookie: this.cookie,
        },
      })
      if (type === 4) {
        console.log(
          '获取项目下的楼栋楼层信息',
          projectItem.name || projectItem.item_name
        )
      } else if (type === 0) {
        console.log(
          '获取楼栋下的楼栋楼层信息',
          projectItem.name || projectItem.item_name
        )
      } else if (type === 1) {
        console.log(
          '获取分区下的楼栋楼层信息',
          projectItem.name || projectItem.item_name
        )
      } else if (type === 2) {
        console.log(
          '获取楼层下的楼栋楼层信息',
          projectItem.name || projectItem.item_name
        )
      } else if (type === 3) {
        console.log(
          '获取单元下的楼栋楼层信息',
          projectItem.name || projectItem.item_name
        )
      }

      return buildFloorData
    } catch (error) {
      console.log('getBuildFloorData bug', projectItem, type, error)
    }
  }

  async sortFunction(projectItem, type = 4) {
    try {
      const buildFloorData = await this.getBuildFloorData(projectItem, type)
      if (
        !_.isEmpty(buildFloorData.data.data) &&
        buildFloorData.data.data.some((buildFloorItem) => !buildFloorItem.sort)
      ) {
        const sortData = await axios({
          method: 'POST',
          params: {
          },
          data: buildFloorData.data.data,
          url: this.host + '/',
          headers: {
            'Content-Type': 'application/json',
            Cookie: this.cookie,
          },
        })
        console.log('排序了', projectItem.name || projectItem.item_name)
      } else {
        console.log('不需要排序', projectItem.name || projectItem.item_name)
      }

      if (!_.isEmpty(buildFloorData.data.data)) {
        for (const buildFloorItem of buildFloorData.data.data || []) {
          if (buildFloorItem.type !== 2) {
            this.asyncPool.handleTask(async () => {
              await this.sortFunction(buildFloorItem, buildFloorItem.type)
            })
          }
        }
      }
    } catch (error) {
      console.log('sortFunction bug', projectItem, type, error)
    }
  }
}

new WorkShell().main()
