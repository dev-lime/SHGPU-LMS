// schedule/schedule.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
	constructor(private readonly scheduleService: ScheduleService) { }

	@Get('group/:id')
	getGroupSchedule(@Param('id') groupId: string) {
		return this.scheduleService.getGroupSchedule(groupId);
	}
}
