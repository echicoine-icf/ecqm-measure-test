import fetchMock from 'fetch-mock';
import { Constants } from '../../constants/Constants';
import { CollectDataFetch } from '../../data/CollectDataFetch';
import { Server } from '../../models/Server';
import { ServerUtils } from '../../utils/ServerUtils';
import { StringUtils } from '../../utils/StringUtils';
import jsonTestCollectDataData from '../resources/fetchmock-data-repo.json';

const selectedPatient = { display: 'John Doe', id: 'selectedPatient' };

beforeEach(() => {
    jest.spyOn(ServerUtils, 'getServerList').mockImplementation(async () => {
        return Constants.serverTestData;
    });
});

test('required properties check', async () => {
    const dataServer: Server = Constants.serverTestData[0];
    try {
        new CollectDataFetch(undefined,
            'selectedMeasure',
            'startDate',
            'endDate',
            true,
            selectedPatient);
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'selectedDataRepo'))
    }

    try {
        new CollectDataFetch(dataServer,
            '',
            'startDate',
            'endDate',
            true,
            selectedPatient);
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'selectedMeasure'))
    }

    try {
        new CollectDataFetch(dataServer,
            'selectedMeasure',
            '',
            'endDate',
            true,
            selectedPatient);
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'startDate'))
    }

    try {
        new CollectDataFetch(dataServer,
            'selectedMeasure',
            'startDate',
            '',
            true,
            selectedPatient);
    } catch (error: any) {
        expect(error.message).toEqual(StringUtils.format(Constants.missingProperty, 'endDate'))
    }
});


test('get CollectData mock', async () => {
    const dataServer: Server = Constants.serverTestData[0];

    const collectDataFetch = new CollectDataFetch(dataServer,
        'selectedMeasure',
        'startDate',
        'endDate',
        true,
        selectedPatient);
    const mockJsonCollectDataData = jsonTestCollectDataData;
    fetchMock.once(collectDataFetch.getUrl(),
        JSON.stringify(mockJsonCollectDataData)
        , { method: 'GET' });
    let collectedData: string | undefined = await (await collectDataFetch.fetchData()).jsonFormattedString
    expect(collectedData).toEqual(JSON.stringify(mockJsonCollectDataData, undefined, 2));

    fetchMock.restore();

});

test('get CollectData mock error', async () => {
    const dataServer: Server = Constants.serverTestData[0];

    const errorMsg = 'this is a test'
    let errorCatch = '';
    const collectDataFetch = new CollectDataFetch(dataServer,
        'selectedMeasure',
        'startDate',
        'endDate',
        true,
        selectedPatient);
    fetchMock.once(collectDataFetch.getUrl(), { throws: new Error(errorMsg) });

    try {
        await collectDataFetch.fetchData()
    } catch (error: any) {
        errorCatch = error.message;
    }

    expect(errorCatch).toEqual('Using http://localhost:8080/1/Measure/selectedMeasure/$collect-data?periodStart=startDate&periodEnd=endDate&subject=Patient/selectedPatient&reportType=subject-list for Collect Data caused: Error: this is a test');

    fetchMock.restore();

});

test('test urlformat', async () => {
    const dataServer: Server = Constants.serverTestData[0];

    let collectDataFetch = new CollectDataFetch(dataServer,
        'selectedMeasure',
        'startDate',
        'endDate',
        true,
        selectedPatient);
    expect(collectDataFetch.getUrl())
        .toEqual('http://localhost:8080/1/Measure/selectedMeasure/$collect-data?periodStart=startDate&periodEnd=endDate&subject=Patient/selectedPatient&reportType=subject-list');
});

test('test urlformat without patient', async () => {
    const dataServer: Server = Constants.serverTestData[0];

    let collectDataFetch = new CollectDataFetch(dataServer,
        'selectedMeasure',
        'startDate',
        'endDate',
        false,
        { display: '', id: '' });
    expect(collectDataFetch.getUrl())
        .toEqual('http://localhost:8080/1/Measure/selectedMeasure/$collect-data?periodStart=startDate&periodEnd=endDate&reportType=subject-list');
});
