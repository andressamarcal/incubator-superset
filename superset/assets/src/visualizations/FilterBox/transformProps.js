/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
const NOOP = () => {};

export default function transformProps(chartProps) {
  const {
    datasource,
    formData,
    hooks,
    initialValues,
    queryData,
    rawDatasource,
  } = chartProps;
  const { onAddFilter = NOOP } = hooks;
  const {
    sliceId,
    dateFilter,
    instantFiltering,
    showDruidTimeGranularity,
    showDruidTimeOrigin,
    showSqlaTimeColumn,
    showSqlaTimeGranularity,
  } = formData;
  //const { verboseMap } = datasource;  // TODO fix imply changes on @superset-ui/chart
  const filterConfigs = formData.filterConfigs || [];

  const filtersFields = filterConfigs.map(flt => ({
    ...flt,
    key: flt.column,
    //label: flt.label || verboseMap[flt.column] || flt.column,
    label: flt.label || flt.column,
  }));

  return {
    chartId: sliceId,
    datasource: datasource.datasources,
    filtersChoices: queryData.data,
    filtersFields,
    instantFiltering,
    onChange: onAddFilter,
    origSelectedValues: initialValues || {},
    showDateFilter: dateFilter,
    showDruidTimeGrain: showDruidTimeGranularity,
    showDruidTimeOrigin,
    showSqlaTimeColumn,
    showSqlaTimeGrain: showSqlaTimeGranularity,
  };
}
