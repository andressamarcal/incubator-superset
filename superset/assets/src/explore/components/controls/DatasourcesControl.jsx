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
import {
  Col,
  Collapse,
  DropdownButton,
  Label,
  MenuItem,
  OverlayTrigger,
  Row,
  Tooltip,
  Well,
} from 'react-bootstrap';
import { t } from '@superset-ui/translation';

import ControlHeader from '../ControlHeader';
import ColumnOption from '../../../components/ColumnOption';
import MetricOption from '../../../components/MetricOption';
import DatasourceModal from '../../../datasource/DatasourceModal';
import ChangeDatasourceModal from '../../../datasource/ChangeDatasourceModal';

const propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.object,
  datasources: PropTypes.array.isRequired,
  datasources_type: PropTypes.string.isRequired,
  onDatasourceSave: PropTypes.func,
};

const defaultProps = {
  onChange: () => {},
  onDatasourceSave: () => {},
  value: null,
};

class DatasourcesControl extends React.PureComponent {
  constructor(props) {
    super(props);

    const datasource_count = this.props.datasources.length;
    this.state = {
      showEditDatasourceModal: Array(datasource_count).fill(false),
      showChangeDatasourceModal: Array(datasource_count).fill(false),
      menuExpanded: Array(datasource_count).fill(false),
      showDatasource: Array(datasource_count).fill(false),
    };

    this.toggleVariable = this.toggleVariable.bind(this);
    this.toggleChangeDatasourceModal = this.toggleChangeDatasourceModal.bind(this);
    this.toggleEditDatasourceModal = this.toggleEditDatasourceModal.bind(this);
    this.toggleShowDatasource = this.toggleShowDatasource.bind(this);
    this.renderDatasource = this.renderDatasource.bind(this);
    this.renderDatasources = this.renderDatasources.bind(this);
  }

  /**
   * Function used to reduce some code duplication
   *  on the three function under
   */
  toggleVariable(variable, datasources_idx) {
    return variable.map( (val, idx) => idx == datasources_idx ? !val : val);
  }

  toggleShowDatasource(datasources_idx) {
    this.setState(({ showDatasource }) => ({
      showDatasource : this.toggleVariable(showDatasource, datasources_idx),
    }));
  }

  toggleChangeDatasourceModal(datasources_idx) {
    this.setState(({ showChangeDatasourceModal }) => ({
      showChangeDatasourceModal: this.toggleVariable(showChangeDatasourceModal, datasources_idx),
    }));
  }

  toggleEditDatasourceModal(datasources_idx) {
    this.setState(({ showEditDatasourceModal }) => ({
      showEditDatasourceModal: this.toggleVariable(showEditDatasourceModal, datasources_idx),
    }));
  }

  renderDatasource(datasource) {
    return (
      <div className="m-t-10">
        <Well className="m-t-0">
          <div className="m-b-10">
            <Label>
              <i className="fa fa-database" /> {datasource.database.backend}
            </Label>
            {` ${datasource.database.name} `}
          </div>
          <Row className="datasource-container">
            <Col md={6}>
              <strong>Columns</strong>
              {datasource.columns.map(col => (
                <div key={col.column_name}>
                  <ColumnOption showType column={col} />
                </div>
              ))}
            </Col>
            <Col md={6}>
              <strong>Metrics</strong>
              {datasource.metrics.map(m => (
                <div key={m.metric_name}>
                  <MetricOption metric={m} showType />
                </div>
              ))}
            </Col>
          </Row>
        </Well>
      </div>
    );
  }

  renderDatasources(datasources_idx) {
    const showDatasource = this.state.showDatasource[datasources_idx];
    const menuExpanded = this.state.menuExpanded[datasources_idx];
    const showChangeDatasourceModal = this.state.showChangeDatasourceModal[datasources_idx];
    const showEditDatasourceModal = this.state.showEditDatasourceModal[datasources_idx];

    const datasource = this.props.datasources[datasources_idx];
    const onChange = this.props.onChange[datasources_idx];
    const onDatasourceSave = this.props.onDatasourceSave[datasources_idx];
    const value = `${datasource.id}__${this.props.datasources_type}`;

    return (
      <Row key={datasources_idx} style={{marginBottom: datasources_idx == this.props.datasources.length - 1 ? 0 : 5}}>
        <div className="btn-group label-dropdown">
          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id={'error-tooltip'}>{t('Click to edit the datasource')}</Tooltip>
            }
          >
            <div className="btn-group">
              <Label onClick={() => this.toggleEditDatasourceModal(datasources_idx)} className="label-btn-label">
                {datasource.name}
              </Label>
            </div>
          </OverlayTrigger>
          <DropdownButton
            noCaret
            title={
              <span>
                <i className={`float-right expander fa fa-angle-${menuExpanded ? 'up' : 'down'}`} />
              </span>}
            className="label label-btn m-r-5"
            bsSize="sm"
            id="datasource_menu"
          >
            <MenuItem
              eventKey="3"
              onClick={() => this.toggleEditDatasourceModal(datasources_idx)}
            >
              {t('Edit Datasource')}
            </MenuItem>
            {datasource.type === 'table' &&
              <MenuItem
                eventKey="3"
                href={`/superset/sqllab?datasourceKey=${value}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('Explore in SQL Lab')}
              </MenuItem>}
            <MenuItem
              eventKey="3"
              onClick={() => this.toggleChangeDatasourceModal(datasources_idx)}
            >
              {t('Change Datasource')}
            </MenuItem>
          </DropdownButton>
          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id={'toggle-datasource-tooltip'}>
                {t('Expand/collapse datasource configuration')}
              </Tooltip>
            }
          >
            <a href="#">
              <i
                className={`fa fa-${showDatasource ? 'minus' : 'plus'}-square m-r-5 m-l-5 m-t-4`}
                onClick={() => this.toggleShowDatasource(datasources_idx)}
              />
            </a>
          </OverlayTrigger>
        </div>
        <Collapse in={showDatasource}>{this.renderDatasource(datasource)}</Collapse>
        <DatasourceModal  // TODO aspedrosa might need changes because of the new multiple datasource support
          datasource={datasource}
          show={showEditDatasourceModal}
          onDatasourceSave={onDatasourceSave}
          onHide={() => this.toggleEditDatasourceModal(datasources_idx)}
        />
        <ChangeDatasourceModal  // TODO aspedrosa might need changes because of the new multiple datasource support
          onDatasourceSave={onDatasourceSave}
          onHide={() => this.toggleChangeDatasourceModal(datasources_idx)}
          show={showChangeDatasourceModal}
          onChange={onChange}
        />
      </Row>
    );
  }

  render() {
    return (
      <div>
        <ControlHeader {...this.props} />
        {_.range(this.props.datasources.length).map(this.renderDatasources)}
      </div>
    );
  }
}

DatasourcesControl.propTypes = propTypes;
DatasourcesControl.defaultProps = defaultProps;

export default DatasourcesControl;
