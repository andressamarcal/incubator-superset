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
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Panel } from 'react-bootstrap';
import Select from 'react-virtualized-select';
import { t } from '@superset-ui/translation';

import VizTypeControl from '../explore/components/controls/VizTypeControl';

const propTypes = {
  datasources: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
};

const styleSelectWidth = { width: 600 };
const multiDatasourceLabelStyle = { marginLeft: 5 };

export default class AddSliceContainer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visType: 'table',
      multipleDatasource: false,
      supportsMultiDatasource: false,
    };

    this.changeDatasource = this.changeDatasource.bind(this);
    this.onChangeMultipleDatasource = this.onChangeMultipleDatasource.bind(this);
    this.changeVisType = this.changeVisType.bind(this);
    this.gotoSlice = this.gotoSlice.bind(this);
  }

  exploreUrl() {
    const formData = encodeURIComponent(
      JSON.stringify({
        viz_type: (this.state.multipleDatasource ? "multi_source_" : "") + this.state.visType,
        datasources: {
          ids: this.state.datasourcesIds,
          type: this.state.datasourcesType,
        }
      }));
    return `/superset/explore/?form_data=${formData}`;
  }

  gotoSlice() {
    window.location.href = this.exploreUrl();
  }

  changeDatasource(e) {
    if (this.state.multipleDatasource) {
      if (e.length > 1 && e.some(ds => ds.value.split("__")[1] != e[0].value.split("__")[1])) {
        return;  // TODO show some error box
      }
      else {
        const types = e.map(ds => ds.value.split("__")[1]);
        this.setState({
          datasourcesType: types.length ? types[0] : null,
        });
      }
      this.setState({
        datasourcesValue: e.map(ds => ds.value),
        datasourcesIds: e.map(ds => parseInt(ds.value.split("__")[0])),
      });
    }
    else {
      this.setState({
        datasourcesValue: e.value,
        datasourcesIds: [parseInt(e.value.split("__")[0])],
        datasourcesType: e.value.split("__")[1],
      });
    }
  }

  onChangeMultipleDatasource(e) {
    const multipleDatasource = e.target.checked;

    if (!multipleDatasource) {
      this.setState({
        datasourcesValue: null,
        datasourcesIds: null,
        datasourcesType: null,
      });
    }

    this.setState({
      multipleDatasource
    });
  }

  changeVisType(visType, supportsMultiDatasource) {
    this.setState({
      visType,
      supportsMultiDatasource,
    });

    if (!supportsMultiDatasource) {
      this.setState({
        multipleDatasource: false,
        datasourcesValue: null,
        datasourcesIds: null,
        datasourcesType: null,
      });
    }
  }

  isBtnDisabled() {
    const dssIds = this.state.datasourcesIds;
    return !(dssIds && dssIds.length && this.state.visType);
  }

  render() {
    return (
      <div className="container">
        <Panel header={<h3>{t('Create a new chart')}</h3>}>
          <div>
            <p>{t('Choose a datasource')}</p>
            <div style={styleSelectWidth}>
              <Select
                clearable={false}
                ignoreAccents={false}
                name="select-datasource"
                onChange={this.changeDatasource}
                options={this.props.datasources}
                placeholder={t('Choose a datasource')}
                style={styleSelectWidth}
                value={this.state.datasourcesValue}
                width={600}
                multi={this.state.multipleDatasource}
              />
            </div>
            <p className="text-muted">
              {t(
                'If the datasource you are looking for is not ' +
                'available in the list, ' +
                'follow the instructions on the how to add it on the ')}
              <a href="https://superset.apache.org/tutorial.html">{t('Superset tutorial')}</a>
            </p>
            {this.state.supportsMultiDatasource && (
              <div>
                <input
                  type="checkbox"
                  id="multiDatasource"
                  onChange={this.onChangeMultipleDatasource}
                  checked={this.state.multipleDatasource}
                />
                <label
                  htmlFor="multiDatasource"
                  style={multiDatasourceLabelStyle}
                >
                  Multiple datasource slice
                </label>
              </div>
            )}
          </div>
          <br />
          <div>
            <p>{t('Choose a visualization type')}</p>
            <VizTypeControl
              name="select-vis-type"
              onChange={this.changeVisType}
              value={this.state.visType}
            />
          </div>
          <br />
          <hr />
          <Button
            bsStyle="primary"
            disabled={this.isBtnDisabled()}
            onClick={this.gotoSlice}
          >
            {t('Create new chart')}
          </Button>
          <br /><br />
        </Panel>
      </div>
    );
  }
}

AddSliceContainer.propTypes = propTypes;
