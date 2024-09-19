import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { Button, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { PatientFetch } from '../data/PatientFetch';
import { PatientGroup, Member } from '../models/PatientGroup';
import { Patient } from '../models/Patient';
import { Server } from '../models/Server';
import { Constants } from '../constants/Constants';

interface props {
  showDataRepo: boolean;
  setShowDataRepo: React.Dispatch<React.SetStateAction<boolean>>;
  servers: Array<Server | undefined>;
  selectedDataRepo: Server | undefined;
  patients: Array<Patient | undefined>;
  fetchPatients: (dataRepo: Server) => void;
  setSelectedPatient: React.Dispatch<React.SetStateAction<Patient | undefined>>;
  selectedPatient: Patient | undefined;
  collectData: (b: boolean) => void;
  loading: boolean;
  setModalShow: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMeasure?: string;
  groups?: Map<string, PatientGroup>
  setSelectedPatientGroup: React.Dispatch<React.SetStateAction<PatientGroup | undefined>>;

}

const DataRepository: React.FC<props> = ({ showDataRepo, setShowDataRepo, servers, selectedDataRepo, patients, fetchPatients,
  setSelectedPatient, selectedPatient, collectData, loading, setModalShow, selectedMeasure, groups, setSelectedPatientGroup }) => {

  const [patientFilter, setPatientFilter] = useState<string>('');

  const [useGroupAsSubject, setUseGroupAsSubject] = useState<boolean>(true);

  const useGroupAsSubjectHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseGroupAsSubject(event.target.checked);
  };

  let patientGroup: PatientGroup | undefined;

  const buildSubjectText = (): string => {
    if (selectedPatient?.id) {
      return 'Patient/' + selectedPatient.id;
    } else if (patientGroup?.id) {
      return 'Group/' + patientGroup.id;
    } else {
      return '';
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const patDisplay = PatientFetch.buildUniquePatientIdentifier(patient);
    patientGroup = selectedMeasure ? groups?.get(selectedMeasure) : undefined;
    let groupingCondition: boolean = true;

    //sometimes can be undefined
    if (patientGroup) {
      let members: Member[] = patientGroup.member;
      let patFound: boolean = false;
      for (let member of members) {
        if (member.entity.reference.split('Patient/')[1] === patient?.id) {
          patFound = true;
          break;
        }
      }
      groupingCondition = patFound;
    } else {
      setSelectedPatientGroup(undefined);
    }

    setSelectedPatientGroup(patientGroup);

    return groupingCondition && patDisplay?.toLowerCase().includes(patientFilter.toLowerCase());
  });

  return (
    <div className='card'>
      <div className='card-header'>
        <div className='row'>
          <div className='col-md-3 order-md-1'>Data Extraction Service/Data Repository</div>
          {showDataRepo ? (
            <div className='col-md-8 order-md-2 text-muted' />
          ) : (
            <div className='col-md-8 order-md-2 text-muted'>
              Selected Patient: {selectedPatient?.display}
            </div>
          )}
          <div className='col-md-1 order-md-3'>
            {showDataRepo ? (
              <Button data-testid='data-repo-hide-section-button' className='btn btn-primary btn-lg float-right' onClick={(e) => setShowDataRepo(false)}>
                Hide
              </Button>
            ) : (
              <Button data-testid='data-repo-show-section-button' className='btn btn-primary btn-lg float-right' onClick={(e) => setShowDataRepo(true)}>
                Show
              </Button>
            )}
          </div>
        </div>
      </div>
      {showDataRepo ? (
        <div className='card-body'>
          <div className='row'>
            <div className='col-md-6 order-md-1'>
              <label>Data Repository Server</label>
            </div>
            <div className='col-md-3 order-md-2'>
              <label>Patient (optional)</label>
            </div>
            <div className='col-md-3 order-md-3 text-right'>
              <label style={{ fontSize: '0.8em' }}>Patient List Count: {filteredPatients.length}</label>
            </div>
          </div>
          <div className='row'>
            <div className='col-md-5 order-md-1'>
              <select data-testid='data-repo-server-dropdown' className='custom-select d-block w-100' id='server' value={selectedDataRepo!.baseUrl}
                onChange={(e) => fetchPatients(servers[e.target.selectedIndex - 1]!)}>
                <option value=''>Select a Server...</option>
                {servers.map((server, index) => (
                  <option key={index}>{server!.baseUrl}</option>
                ))}
              </select>
            </div>
            <div className='col-md-1 order-md-2'>
              <OverlayTrigger placement={'top'} overlay={
                <Tooltip>Add an Endpoint</Tooltip>
              }>
                <Button variant='outline-primary' onClick={() => setModalShow(true)}>+</Button>
              </OverlayTrigger>
            </div>
            <div className='col-md-6 order-md-2'>
              <select data-testid='data-repo-patient-dropdown' className='custom-select d-block w-100' id='patient' value={selectedPatient?.id || ''}
                onChange={(e) => {
                  const selectedPatientId = e.target.value;
                  const selectedPatientObject = patients.find(
                    (patient) => patient?.id === selectedPatientId
                  );

                  setSelectedPatient(selectedPatientObject || undefined);
                }}>
                <option value=''>Select a Patient...</option>
                {filteredPatients.map((patient, index) => (
                  <option key={index} value={patient?.id || ''}>
                    {PatientFetch.buildUniquePatientIdentifier(patient)}
                  </option>
                ))}
              </select>
              <input type='text' className='form-control' placeholder='Filter patients...' value={patientFilter}
                onChange={(e) => setPatientFilter(e.target.value)} />
            </div>
            <div className='col-md-5 order-md-2'>
              <br />
              {loading ? (
                <Button data-testid='data-repo-collect-data-button-spinner' className='w-100 btn btn-primary btn-lg' id='evaluate' disabled={loading}>
                  <Spinner
                    as='span'
                    variant='light'
                    size='sm'
                    role='status'
                    aria-hidden='true'
                    animation='border' />
                  Loading...
                </Button>
              ) : (
                <Button
                  data-testid='data-repo-collect-data-button'
                  className='w-100 btn btn-primary btn-lg'
                  id='evaluate'
                  disabled={loading}
                  onClick={(e) => collectData(useGroupAsSubject)}>
                  Collect Data</Button>
              )}
            </div>
          </div>
          <div className='row-md-1 ml-auto'>
            {buildSubjectText().length > 0 &&
              <label>
                <input
                  type="checkbox"
                  checked={useGroupAsSubject}
                  onChange={useGroupAsSubjectHandler}
                  disabled={loading}>
                </input>
                {' subject=' + buildSubjectText()}
              </label>
            }
            {(!useGroupAsSubject || buildSubjectText().length === 0) && (
              <div>
                {Constants.largeDataNOTE}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
};

export default DataRepository;
