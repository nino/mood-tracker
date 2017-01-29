/* @flow */

export type ChartAction =
    { type: 'charts/REQUEST_ZOOM', chartId: number, zoomFactor: number }
  | { type: 'charts/SET_ZOOM_FACTOR', chartId: number, zoomFactor: number }
  | { type: 'charts/FINISH_ZOOM', chartId: number }
  | { type: 'charts/TOGGLE_VISIBILITY', metricId: number }
  | { type: 'charts/SCROLL_BY', chartId: number, deltaX: number }
  ;
