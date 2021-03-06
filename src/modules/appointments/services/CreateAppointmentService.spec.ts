import AppError from '@shared/errors/AppError';

import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import FakeNotificationsRepository from '@modules/notifications/repositories/fakes/FakeNotificationsRepository';
import CreateAppointmentService from './CreateAppointmentService';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';

let fakeAppointmentRepository: FakeAppointmentsRepository;
let fakeNotificationsRepository: FakeNotificationsRepository;
let fakeCacheProvider: FakeCacheProvider;
let createAppointmentService: CreateAppointmentService;

describe('CreateAppointment', () => {
  beforeEach(() => {
    fakeAppointmentRepository = new FakeAppointmentsRepository();
    fakeNotificationsRepository = new FakeNotificationsRepository();
    fakeCacheProvider = new FakeCacheProvider();

    createAppointmentService = new CreateAppointmentService(
      fakeAppointmentRepository,
      fakeNotificationsRepository,
      fakeCacheProvider,
    );
  });
  it('should be able to create a new repository', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 6, 27, 11).getTime();
    });

    const appointment = await createAppointmentService.execute({
      date: new Date(2020, 6, 27, 13),
      provider_id: '123456',
      user_id: 'user',
    });

    expect(appointment).toHaveProperty('id');
    expect(appointment.provider_id).toBe('123456');
  });

  it('should not be able to create a new repository on the same time', async () => {
    const date = new Date(2020, 6, 27, 14);

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 6, 27, 13).getTime();
    });

    await createAppointmentService.execute({
      date: date,
      provider_id: '123456',
      user_id: 'user',
    });

    await expect(
      createAppointmentService.execute({
        date: date,
        provider_id: '1234567',
        user_id: 'user',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment on a past date', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 6, 27, 12).getTime();
    });

    await expect(
      createAppointmentService.execute({
        date: new Date(2020, 6, 27, 11),
        provider_id: '1234567',
        user_id: 'user',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment with same user as provider', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 6, 27, 12).getTime();
    });

    await expect(
      createAppointmentService.execute({
        date: new Date(2020, 6, 27, 13),
        provider_id: 'user_id',
        user_id: 'user_id',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment before 8AM and after 5PM', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 6, 27, 12).getTime();
    });

    await expect(
      createAppointmentService.execute({
        date: new Date(2020, 6, 27, 7),
        provider_id: '123123',
        user_id: 'user_id',
      }),
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      createAppointmentService.execute({
        date: new Date(2020, 6, 27, 18),
        provider_id: '123123',
        user_id: 'user_id',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
