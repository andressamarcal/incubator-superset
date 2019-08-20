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
  value: PropTypes.string,
  datasource: PropTypes.object.isRequired,
  onDatasourceSave: PropTypes.func,
};

const defaultProps = {
  onChange: () => {},
  onDatasourceSave: () => {},
  value: null,
};

class DatasourceControl extends React.PureComponent {
  constructor(props) {
    super(props);

    if (Array.isArray(this.props.datasource)) {
      const datasource_count = this.props.datasource.length;
      this.state = {
        showEditDatasourceModal: Array(datasource_count).fill(false),
        showChangeDatasourceModal: Array(datasource_count).fill(false),
        menuExpanded: Array(datasource_count).fill(false),
        showDatasource: Array(datasource_count).fill(false),
      };
    }
    else {
      this.state = {
        showEditDatasourceModal: false,
        showChangeDatasourceModal: false,
        menuExpanded: false,
        showDatasource: false,
      };
    }

    this.toggleVariable = this.toggleVariable.bind(this);
    this.toggleChangeDatasourceModal = this.toggleChangeDatasourceModal.bind(this);
    this.toggleEditDatasourceModal = this.toggleEditDatasourceModal.bind(this);
    this.toggleShowDatasource = this.toggleShowDatasource.bind(this);
    this.renderDatasource = this.renderDatasource.bind(this);
    this.renderDatasourceLayout = this.renderDatasourceLayout.bind(this);
    this.renderDatasources = this.renderDatasources.bind(this);
  }

  /**
   * Function used to reduce some code duplication
   *  on the three function under
   */
  toggleVariable(variable, datasource_idx) {
    return datasource_idx ?
      variable.map( (val, idx) => idx == datasource_idx ? !val : val) :
      !variable;
  }

  toggleShowDatasource(datasource_idx) {
    this.setState(({ showDatasource }) => ({
      showDatasource : this.toggleVariable(showDatasource, datasource_idx),
    }));
  }

  toggleChangeDatasourceModal(datasource_idx) {
    this.setState(({ showChangeDatasourceModal }) => ({
      showChangeDatasourceModal: this.toggleVariable(showChangeDatasourceModal, datasource_idx),
    }));
  }

  toggleEditDatasourceModal(datasource_idx) {
    this.setState(({ showEditDatasourceModal }) => ({
      showEditDatasourceModal: this.toggleVariable(showEditDatasourceModal, datasource_idx),
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

  renderDatasourceLayout(datasource_idx) {
    let { showDatasource, menuExpanded, showChangeDatasourceModal, showEditDatasourceModal } = this.state;
    let { datasource, onChange, onDatasourceSave, value } = this.props;

    if (datasource_idx) {
      showDatasource = this.state.showDatasource[datasource_idx];
      menuExpanded = this.state.menuExpanded[datasource_idx];
      showChangeDatasourceModal = this.state.showChangeDatasourceModal[datasource_idx];
      showEditDatasourceModal = this.state.showEditDatasourceModal[datasource_idx];

      datasource = this.props.datasource[datasource_idx];
      onChange = this.props.onChange[datasource_idx];
      onDatasourceSave = this.props.onDatasourceSave[datasource_idx];
      value = this.props.value[datasource_idx];
    }

    return (
      <React.Fragment>
        <div className="btn-group label-dropdown">
          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id={'error-tooltip'}>{t('Click to edit the datasource')}</Tooltip>
            }
          >
            <div className="btn-group">
              <Label onClick={() => this.toggleEditDatasourceModal(datasource_idx)} className="label-btn-label">
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
              onClick={() => this.toggleEditDatasourceModal(datasource_idx)}
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
              onClick={() => this.toggleChangeDatasourceModal(datasource_idx)}
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
                onClick={() => this.toggleShowDatasource(datasource_idx)}
              />
            </a>
          </OverlayTrigger>
        </div>
        <Collapse in={showDatasource}>{this.renderDatasource(datasource)}</Collapse>
        <DatasourceModal
          datasource={datasource}
          show={showEditDatasourceModal}
          onDatasourceSave={onDatasourceSave}
          onHide={() => this.toggleEditDatasourceModal(datasource_idx)}
        />
        <ChangeDatasourceModal
          onDatasourceSave={onDatasourceSave}
          onHide={() => this.toggleChangeDatasourceModal(datasource_idx)}
          show={showChangeDatasourceModal}
          onChange={onChange}
        />
      </React.Fragment>
    );
  }

  renderDatasources(datasource_idx) {
    return (
      <Col md={4}>
        {this.renderDatasourceLayout(datasource_idx)}
      </Col>
    );
  }

  render() {
    let datasource_render;
    if (Array.isArray(this.props.datasource)) {
      datasource_render = (
        <Row>
          {_.range(this.props.datasource.length).map(this.renderDatasources)}
        </Row>
      )
    }
    else {
      datasource_render = this.renderDatasourceLayout();
    }

    return (
      <div>
        <ControlHeader {...this.props} />
        {datasource_render}
      </div>
    );
  }
}

DatasourceControl.propTypes = propTypes;
DatasourceControl.defaultProps = defaultProps;

export default DatasourceControl;
