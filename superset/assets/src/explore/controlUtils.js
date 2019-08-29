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
import controlPanelConfigs, { sectionsToRender } from './controlPanels';
import controls from './controls';

export function getFormDataFromControls(controlsState) {
  const formData = {};
  Object.keys(controlsState).forEach((controlName) => {
    formData[controlName] = controlsState[controlName].value;
  });
  return formData;
}

export function validateControl(control) {
  const validators = control.validators;
  if (validators && validators.length > 0) {
    const validatedControl = { ...control };
    const validationErrors = [];
    validators.forEach((f) => {
      const v = f(control.value);
      if (v) {
        validationErrors.push(v);
      }
    });
    delete validatedControl.validators;
    return { ...validatedControl, validationErrors };
  }
  return control;
}

function isGlobalControl(controlKey) {
  return controlKey in controls;
}

export function getControlConfig(controlKey, vizType) {
  // Gets the control definition, applies overrides, and executes
  // the mapStatetoProps
  const vizConf = controlPanelConfigs[vizType] || {};
  const controlOverrides = vizConf.controlOverrides || {};

  if (!isGlobalControl(controlKey)) {
    for (const section of vizConf.controlPanelSections) {
      for (const controlArr of section.controlSetRows) {
        for (const control of controlArr) {
          if (control != null && typeof control === 'object') {
            if (control.config && control.name === controlKey) {
              return {
                ...control.config,
                ...controlOverrides[controlKey],
              };
            }
          }
        }
      }
    }
  }

  return {
    ...controls[controlKey],
    ...controlOverrides[controlKey],
  };
}

export function applyMapStateToPropsToControl(control, state) {
  if (control.mapStateToProps) {
    const appliedControl = { ...control };
    if (state) {
      Object.assign(appliedControl, control.mapStateToProps(state, control));
    }
    delete appliedControl.mapStateToProps;
    return appliedControl;
  }
  return control;
}

function handleMissingChoice(controlKey, control) {
  // If the value is not valid anymore based on choices, clear it
  const value = control.value;
  if (
    control.type === 'SelectControl' &&
    !control.freeForm &&
    control.choices &&
    value
  ) {
    const alteredControl = { ...control };
    const choiceValues = control.choices.map(c => c[0]);
    if (control.multi && value.length > 0) {
      alteredControl.value = value.filter(el => choiceValues.indexOf(el) > -1);
      return alteredControl;
    } else if (!control.multi && choiceValues.indexOf(value) < 0) {
      alteredControl.value = null;
      return alteredControl;
    }
  }
  return control;
}

export function getControlState(controlKey, vizType, state, value) {
  let controlValue = value;
  const controlConfig = getControlConfig(controlKey, vizType);
  let controlState = { ...controlConfig };
  controlState = applyMapStateToPropsToControl(controlState, state);

  // If default is a function, evaluate it
  if (typeof controlState.default === 'function') {
    controlState.default = controlState.default(controlState);
  }

  // If a choice control went from multi=false to true, wrap value in array
  if (controlConfig.multi && value && !Array.isArray(value)) {
    controlValue = [value];
  }
  controlState.value = controlValue === undefined ? controlState.default : controlValue;
  controlState = handleMissingChoice(controlKey, controlState);
  return validateControl(controlState);
}

export function getAllControlsState(vizType, datasourcesType, state, formData) {
  const controlsState = {};
  sectionsToRender(vizType, datasourcesType).forEach(
    section => section.controlSetRows.forEach(
      fieldsetRow => fieldsetRow.forEach((field) => {
        if (typeof field === 'string') {
          controlsState[field] = getControlState(field, vizType, state, formData[field]);
        } else if (field != null && typeof field === 'object') {
          if (field.config && field.name) {
            controlsState[field.name] = { ...field.config };
          }
        }
      }),
    ),
  );

  return controlsState;
}

export function mergeArraysOfObjects(objects, extractor, filter, equals) {
  const extractedObjects = objects.map(extractor);
  const objectsCount = extractedObjects.length;
  if (objectsCount == 0) {
    return [];
  } else if (objectsCount == 1) {
    return extractedObjects[0].filter(filter);
  }


  let mergedArray = extractedObjects[0].filter(filter);
  for (let i = 1; i < extractedObjects.length && mergedArray !== []; i++) {
    const arrayToMerge = extractedObjects[i].filter(filter);

    const newMergedArray = [];
    for (const e of mergedArray) {
      if (arrayToMerge.find(equals(e))) {
        newMergedArray.push(e);
      }
    }

    mergedArray = newMergedArray;
  }

  return mergedArray;
}

export function mergeColumns(datasources, columnFilter) {
  return mergeArraysOfObjects(
    datasources,
    ds => ds.columns,
    columnFilter,
    c1 => (c2 => c1.column === c2.column && c1.type === c2.type && c1.expression === c2.expression)
  );
}

export function mergeMetrics(datasources, datasourceType) {
  return mergeArraysOfObjects(
    datasources,
    ds => ds.metrics,
    e => true,
    m1 => (
      m2 =>
        m1.metric_type === m2.metric_type &&
        (
          (datasourceType == 'druid' && m1.json === m2.json) ||
          (datasourceType == 'table' && m1.expression === m2.expression))
        )
  );
}
