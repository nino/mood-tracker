import DropboxController from './DropboxController'

function receiveAction(action, params) {
    switch(action) {
        case 'logoutClicked':
            DropboxController.logout()
            this.forceUpdate()
            break
        case 'log metric':
            logMetricAction.bind(this)(params.name, params.rating)
            break
        case 'start editing':
            startEditingMetricAction.bind(this)(params.name)
            break
        case 'update metric':
            updateMetricAction.bind(this)(params.name, params.newProps)
            break
        case 'stop editing':
            stopEditingAction.bind(this)()
            break
        default:
            console.log('Unknown action sent')
    }
}

function startEditingMetricAction(name) {
    console.log('yes editing now: ', name)
    this.setState({editing: name})
}

function updateMetricAction(name, newProps) {
}

function logMetricAction(name, rating) {
    console.log('logging metric ' + name + ': ' + rating)
    let date = new Date()
    date.setHours(date.getHours() - date.getTimezoneOffset() / 60)
    let newEntry = {
        date: date.toJSON(),
        value: rating
    }
    let metricIndex = this.state.data.findIndex(
        metric => metric.name === name
    )
    let newData = []
    Object.assign(newData, this.state.data)
    newData[metricIndex].entries.push(newEntry)
    this.setState({data: newData})
    DropboxController.writeFile(
        'data.json', JSON.stringify(this.state.data, null, 2)
    ).then(() => {console.log('data written')})
    .catch((error) => {console.error('error writing data', error)})
}

function stopEditingAction() {
    this.setState({editing: null})
}

module.exports = {
    receiveAction
}
