import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { PatientFetch } from '../../data/PatientFetch';
import { StringUtils } from '../../utils/StringUtils';
import jsonTestPatientsData from '../resources/fetchmock-patients.json';

beforeEach(() => {
    fetchMock.restore(); // Clear mock routes before each test
    fetchMock.mock(Constants.serverTestData[0].baseUrl + 'Patient?_summary=count', `{
        "resourceType": "Bundle",
        "id": "604e7395-8850-4a15-a2f2-67a1d334b2d0",
        "meta": {
          "lastUpdated": "2024-01-12T16:42:57.392+00:00",
          "tag": [ {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
            "code": "SUBSETTED",
            "display": "Resource encoded in summary mode"
          } ]
        },
        "type": "searchset",
        "total": 200
      }`);
});



test('required properties check', async () => {

   const blankServer = {
        id: '',
        baseUrl: '',
        authUrl: '',
        tokenUrl: '',
        callbackUrl: '',
        clientID: '',
        clientSecret: '',
        scope: ''
    };

    try {
        const patientFetch = await PatientFetch.createInstance(blankServer);
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'dataRepositoryServer'))
    }

});

test('get patients mock', async () => {
    const patientFetch = await PatientFetch.createInstance(Constants.serverTestData[0]);
    const mockJsonPatientsData = jsonTestPatientsData;
    fetchMock.once(patientFetch.getUrl(),
        JSON.stringify(mockJsonPatientsData)
        , { method: 'GET' });

    let patientList: string[] = await (await patientFetch.fetchData()).operationData

    expect(patientList.length).toEqual(21);
    fetchMock.restore();

});

test('get patients mock function error', async () => {
    const errorMsg = 'this is a test'
    let errorCatch = '';
    const patientFetch = await PatientFetch.createInstance(Constants.serverTestData[0]);

    fetchMock.once(patientFetch.getUrl(), {
        throws: new Error(errorMsg)
    });

    try {
        await patientFetch.fetchData()
    } catch (error: any) {
        errorCatch = error.message;
    }

    expect(errorCatch).toEqual('Using ' + Constants.serverTestData[0].baseUrl + 'Patient?_count=200 for Patients caused: Error: this is a test');

    fetchMock.restore();

});

test('get patients mock return error', async () => {
    let errorCatch = '';
    const patientFetch = await PatientFetch.createInstance(Constants.serverTestData[0]);

    fetchMock.once(patientFetch.getUrl(), 400);

    try {
        await patientFetch.fetchData()
    } catch (error: any) {
        errorCatch = error.message;
    }

    expect(errorCatch).toEqual('Using ' + Constants.serverTestData[0].baseUrl + 'Patient?_count=200 for Patients caused: Error: 400 (Bad Request)');

    fetchMock.restore();
});

test('test urlformat', async () => {
    let patientFetch = await PatientFetch.createInstance(Constants.serverTestData[0]);
    expect(patientFetch.getUrl())
        .toEqual(Constants.serverTestData[0].baseUrl + 'Patient?_count=200');
});

