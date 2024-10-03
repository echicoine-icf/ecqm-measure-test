import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Button, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { Measure } from '../models/Measure';
import { Server } from '../models/Server';
import SectionalTitleBar from './SectionalTitleBar';

// Props for KnowledgeRepository
interface Props {
  showKnowledgeRepo: boolean;
  setShowKnowledgeRepo: React.Dispatch<React.SetStateAction<boolean>>;
  servers: any;
  fetchMeasures: (knowledgeRepo: Server) => void;
  selectedKnowledgeRepo: Server | undefined;
  measures: Array<Measure | undefined>;
  setSelectedMeasure: React.Dispatch<React.SetStateAction<string>>;
  selectedMeasure: string;
  getDataRequirements: () => void;
  loading: boolean;
  setModalShow: React.Dispatch<React.SetStateAction<boolean>>;
}



// KnowledgeRepository component displays the fields for selecting and using the Knowledge Repository
const KnowledgeRepository: React.FC<Props> = ({ showKnowledgeRepo, setShowKnowledgeRepo, servers,
  fetchMeasures, selectedKnowledgeRepo, measures, setSelectedMeasure,
  selectedMeasure, getDataRequirements, loading, setModalShow }) => {

  return (
    <div className='card'>
      <div className='card-header'>
        <SectionalTitleBar dataTestID='knowledge-repo-' setshowSection={setShowKnowledgeRepo} showSection={showKnowledgeRepo} title='Knowledge Repository' />
      </div>
      {showKnowledgeRepo ? (
        <div className='card-body' style={{ transition: 'all .1s' }}>
          <div className='row'>
            <div className='col-md-6 order-md-1'>
              <label>Knowledge Repository Server</label>
            </div>
            <div className='col-md-3 order-md-2'>
              <label>Measure</label>
            </div>
            <div className='col-md-3 order-md-3 text-right'>
              <label style={{ fontSize: '0.8em' }}>Measure List Count: {measures.length}</label>
            </div>
          </div>
          <div className='row'>
            <div className='col-md-5 order-md-1'>
              <select disabled={loading} data-testid='knowledge-repo-server-dropdown' className='custom-select d-block w-100' id='server' value={selectedKnowledgeRepo?.baseUrl}
                onChange={(e) => fetchMeasures(servers[e.target.selectedIndex - 1]!)}>
                <option value={'Select a Server...'}>
                  Select a Server...</option>
                {servers.map((server: any, index: React.Key | null | undefined) => (
                  <option key={index}>{server!.baseUrl}</option>
                ))}
              </select>
            </div>
            <div className='col-md-1 order-md-2'>
              <OverlayTrigger placement={'top'} overlay={
                <Tooltip>Add an Endpoint</Tooltip>
              }>
                <Button disabled={loading} data-testid='knowledge-repo-server-add-button' variant='outline-primary' onClick={() => setModalShow(true)}>+</Button>
              </OverlayTrigger>
            </div>
            <div className='col-md-6 order-md-3'>
              <select disabled={loading} data-testid='knowledge-repo-measure-dropdown' className='custom-select d-block w-100' id='measure' value={selectedMeasure}
                onChange={(e) => setSelectedMeasure(e.target.value)}>
                <option value=''>Select a Measure...</option>
                {measures.map((measure, index) => (
                  <option key={index}>{measure!.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className='row'>
            <div className='col-md-5 order-md-2'>
              <br />
              {loading ? (
                <Button data-testid='get-data-requirements-button-spinner' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}>
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
                <Button data-testid='get-data-requirements-button' className='w-100 btn btn-primary btn-lg' id='getData' disabled={loading}
                  onClick={(e) => getDataRequirements()}>
                  Get Data Requirements
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
};

export default KnowledgeRepository;