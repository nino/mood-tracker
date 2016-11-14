import DropboxController from './DropboxController'
import {max} from 'lodash'

/**
 * The App component binds this function to itself,
 * such that `this` refers to the App component,
 * since that is where the state is stored.
 */
function receiveAction(action, params) {
    if (!params)
        params = {}
    switch(action) {
        case 'logoutClicked':
            DropboxController.logout()
            this.forceUpdate()
            break
        case 'log metric':
            logMetricAction.bind(this)(params.id, params.rating)
            break
        case 'start editing':
            startEditingMetricAction.bind(this)(params.id, params.discard)
            break
        case 'update metric':
            updateMetricAction.bind(this)(params.id, params.newProps)
            break
        case 'stop editing':
            stopEditingAction.bind(this)(params.discard)
            break
        case 'add metric':
            addMetricAction.bind(this)()
            break
        case 'reorder metrics':
            reorderMetricsAction.bind(this)(params.id, params.direction)
            break
        case 'delete metric':
            deleteMetricAction.bind(this)(params.id, params.confirmed)
            break
        case 'update form element':
            updateFormElementAction.bind(this)(params)
            break
        case 'confirm modal':
            confirmModalAction.bind(this)(params)
            break
        case 'cancel modal':
            cancelModalAction.bind(this)(params)
            break
        default:
            console.log('Unknown action sent')
    }
}

function startEditingMetricAction(id, discard) {
    if (this.state.editing && !discard && !isEditedMetricUnchanged.bind(this)()) {
        let modal = {
            title: 'Unsaved changes',
            message: 'There are unsaved changes in the metric "'
                + this.state.editing.name
                + '". Do you wish to discard these changes?',
            buttons: [
                {label: 'Discard changes', purpose: 'confirm'},
                {
                    label: 'Continue editing ' + this.state.editing.name,
                    purpose: 'cancel'
                }
            ],
            nextAction: {
                name: 'start editing',
                params: {
                    discard: true,
                    id: id
                }
            }
        }
        this.setState({modal})
    }
    else {
        if (!this.state.metrics)
            return
        let index = this.state.metrics.findIndex(m=>m.id===id)
        if (index === -1)
            return
        let editedMetric = Object.assign({}, this.state.metrics[index])
        delete editedMetric.entries
        this.setState({editing: editedMetric})
    }
}

function updateMetricAction(id, newProps) {
    let metricIndex = this.state.metrics.findIndex(m=>m.id===id)
    let updatedMetrics = Object.assign([], this.state.metrics)
    updatedMetrics[metricIndex] = Object.assign(
        {},
        updatedMetrics[metricIndex],
        newProps
    )
    this.setState({metrics: updatedMetrics})
    this.setState({editing: null})
    if (process.env.NODE_ENV !== 'test') {
        DropboxController.writeFile(
            'data.json', JSON.stringify(this.state.metrics, null, 2)
        ).then(() => {console.log('data written')})
        .catch((error) => {console.error('error writing data', error)})
    }
}

function logMetricAction(id, rating) {
    console.log('logging metric ' + id + ': ' + rating)
    let date = new Date()
    date.setHours(date.getHours() - date.getTimezoneOffset() / 60)
    let newEntry = {
        date: date.toJSON(),
        value: rating
    }
    let metricIndex = this.state.metrics.findIndex(
        metric => metric.id === id
    )
    let newData = Object.assign([], this.state.metrics)

    newData[metricIndex] = Object.assign({}, newData[metricIndex])
    newData[metricIndex].entries = newData[metricIndex].entries.concat(newEntry)
    this.setState({metrics: newData})
    if (process.env.NODE_ENV !== 'test') {
        DropboxController.writeFile(
            'data.json', JSON.stringify(this.state.metrics, null, 2)
        ).then(() => {console.log('data written')})
        .catch((error) => {console.error('error writing data', error)})
    }
}

function stopEditingAction(discard) {
    if (!this.state.editing) {
        return;
    }
    else if (isEditedMetricUnchanged.bind(this)()) {
        this.setState({editing: null})
    }
    else if (!discard) {
        let modal = {
            message: 'There are unsaved changes in the metric "'
                + this.state.editing.name + '".',
            title: 'Discard changes?',
            buttons: [
                { label: 'Discard changes', purpose: 'confirm' },
                { label: 'Continue editing', purpose: 'cancel' }
            ],
            nextAction: {
                name: 'stop editing',
                params: { discard: true }
            }
        }
        this.setState({modal: modal})
    }
    else if (discard) {
        this.setState({editing: null})
    }
}

function addMetricAction() {
    let metrics
    let newId
    if (this.state.metrics && this.state.metrics.length > 0) {
        metrics = this.state.metrics
        newId = max(this.state.metrics.map(m=>m.id)) + 1
    }
    else {
        metrics = []
        newId = 1
    }
    let newMetric = {
        id: newId,
        name: 'Untitled metric',
        type: 'int',
        maxValue: 10,
        minValue: 1,
        entries: [],
        colorGroups: []
    }
    let updatedMetrics = metrics.concat(newMetric)
    let editedMetric = Object.assign({}, newMetric)
    delete editedMetric.entries
    this.setState({metrics: updatedMetrics, editing: editedMetric})
    if (process.env.NODE_ENV !== 'test') {
        DropboxController.writeFile(
            'data.json', JSON.stringify(this.state.metrics, null, 2)
        ).then(() => {console.log('data written')})
        .catch((error) => {console.error('error writing data', error)})
    }
}

function reorderMetricsAction(metricId, direction) {
    // find index of metric to be moved
    let metricIndex = this.state.metrics.findIndex(m => m.id === metricId)
    // return if can't find metric
    if (metricIndex === -1)
        return
    // return if moving bottommost metric down
    else if (metricIndex === (this.state.metrics.length-1)
             && direction === 'down') {
        return
    }
    // return if moving topmost metric up
    else if (metricIndex === 0 && direction === 'up') {
        return
    }
    // actually do reordering
    else {
        let updatedMetrics
        if (direction === 'up') {
            updatedMetrics = this.state.metrics.slice(0, metricIndex-1).concat(
                this.state.metrics[metricIndex],
                this.state.metrics[metricIndex-1],
                this.state.metrics.slice(metricIndex+1, this.state.metrics.length)
            )
        }
        else if (direction === 'down') {
            updatedMetrics = this.state.metrics.slice(0, metricIndex).concat(
                this.state.metrics[metricIndex+1],
                this.state.metrics[metricIndex],
                this.state.metrics.slice(metricIndex+2, this.state.metrics.length)
            )
        }
        else {
            return // unknown direction
        }
        this.setState({...this.state, metrics: updatedMetrics})
    }
    if (process.env.NODE_ENV !== 'test') {
        DropboxController.writeFile(
            'data.json', JSON.stringify(this.state.metrics, null, 2)
        ).then(() => {console.log('data written')})
        .catch((error) => {console.error('error writing data', error)})
    }
}

function deleteMetricAction(id, confirmed) {
    let index = this.state.metrics.findIndex(m=>m.id===id)
    if (confirmed) {
        let updatedMetrics = this.state.metrics.slice(0, index).concat(
            this.state.metrics.slice(index+1, this.state.metrics.length)
        )
        this.setState({editing: null, metrics: updatedMetrics})
    }
    else {
        let message = 'Are you sure you wish to delete the metric "'
            + this.state.metrics[index].name + '"?'
        let modal = {
            title: 'Confirm deletion',
            message: message,
            buttons: [
                { label: 'Delete', purpose: 'confirm' },
                { label: 'Don\'t delete', purpose: 'cancel' }
            ],
            nextAction: {
                name: 'delete metric',
                params: {
                    id: id,
                    confirmed: true
                }
            }
        }
        this.setState({modal})
    }

    if (process.env.NODE_ENV !== 'test') {
        DropboxController.writeFile(
            'data.json', JSON.stringify(this.state.metrics, null, 2)
        ).then(() => {console.log('data written')})
        .catch((error) => {console.error('error writing data', error)})
    }
}

function updateFormElementAction(params) {
    // metric-settings forms
    let match = params.formId.match(/metric-settings-form-(\d+)/)
    if (match
        && this.state.editing
        && parseInt(match[1], 10) === this.state.editing.id) {
        let updatedEditing = Object.assign({}, this.state.editing)
        updatedEditing[params.name] = params.value
        updatedEditing.maxValue = parseInt(updatedEditing.maxValue, 10)
        updatedEditing.minValue = parseInt(updatedEditing.minValue, 10)
        updatedEditing.type = 'int'
        if (updatedEditing.colorGroups) {
            updatedEditing.colorGroups = updatedEditing.colorGroups.map(cg => {
                let newcg = Object.assign({}, cg)
                newcg.maxValue = parseInt(newcg.maxValue, 10) || ''
                newcg.minValue = parseInt(newcg.minValue, 10) || ''
                return newcg
            })
        }
        this.setState({editing: updatedEditing})
    }
}

function confirmModalAction(params) {
    if (this.state.modal.nextAction) {
        let actionName = this.state.modal.nextAction.name
        let actionparams = this.state.modal.nextAction.params
        receiveAction.bind(this)(actionName, actionparams)
    }
    this.setState({modal: null})
}

function cancelModalAction(params) {
    let ed = this.state.editing
    this.setState({editing: ed, modal: null})
}

function isEditedMetricUnchanged() {
    let e = this.state.editing
    let m = this.state.metrics.find(metric=>metric.id===this.state.editing.id)
    const colorGroupsUnchanged = (cg1, cg2) => {
        if (!cg1 || !cg2)
            return false
        if (cg1.length !== cg2.length)
            return false
        for (let i = 0; i < cg1.length; i++) {
            if (cg1.minValue !== cg2.minValue
                || cg1.maxValue !== cg2.maxValue
                || cg1.color !== cg2.color) {
                return false
            }
        }
        return true
    }
    return (
        e.name === m.name
        && e.maxValue === m.maxValue
        && e.minValue === m.minValue
        && colorGroupsUnchanged(e.colorGroups, m.colorGroups)
        && e.type === m.type
    )
}

module.exports = {
    receiveAction
}

