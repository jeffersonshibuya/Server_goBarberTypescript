import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import ListProviderDayAvailabilityService from './ListProviderDayAvailabilityService';

let fakeAppointmentsRepository: FakeAppointmentsRepository;
let listProviderDayAvailabilityService: ListProviderDayAvailabilityService;

describe('ListProviderDayAvailability', () => {
  beforeEach(() => {
    fakeAppointmentsRepository = new FakeAppointmentsRepository();
    listProviderDayAvailabilityService = new ListProviderDayAvailabilityService(
      fakeAppointmentsRepository,
    );
  });

  it('should be able to list the day availatility from provider', async () => {
    await fakeAppointmentsRepository.create({
      provider_id: 'user',
      user_id: '',
      date: new Date(2020, 6, 25, 8, 0, 0),
    });

    await fakeAppointmentsRepository.create({
      provider_id: 'user',
      user_id: '',
      date: new Date(2020, 6, 25, 10, 0, 0),
    });

    const availability = await listProviderDayAvailabilityService.execute({
      provider_id: 'user',
      day: 25,
      year: 2020,
      month: 7,
    });

    expect(availability).toEqual(
      expect.arrayContaining([
        { hour: 8, available: false },
        { hour: 10, available: false },
      ]),
    );
  });

  it('should not be able to schedule appointment in the past', async () => {
    await fakeAppointmentsRepository.create({
      provider_id: 'user',
      user_id: '',
      date: new Date(2020, 6, 25, 14, 0, 0),
    });

    await fakeAppointmentsRepository.create({
      provider_id: 'user',
      user_id: '',
      date: new Date(2020, 6, 25, 15, 0, 0),
    });

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 6, 25, 11).getTime();
    });

    const availability = await listProviderDayAvailabilityService.execute({
      provider_id: 'user',
      day: 25,
      year: 2020,
      month: 7,
    });

    expect(availability).toEqual(
      expect.arrayContaining([
        { hour: 8, available: false },
        { hour: 9, available: false },
        { hour: 10, available: false },
        { hour: 13, available: true },
        { hour: 14, available: false },
        { hour: 15, available: false },
        { hour: 16, available: true },
      ]),
    );
  });
});
