import Project from "../models/Project";
import Task from "../models/Task"

import v from "../helpers/Validation"

import { IAny, IResponse } from "../interfaces";
import { SQLDate } from "sqlifier";

export default class TaskServices {
    static async add (wrapRes: IResponse, body: IAny, { userInfo }: IAny) : Promise <IResponse> {
        try {
            const { objective, leadEmployeeId, projectId } = body;
            
            v.validate({
                'Objective': { value: objective, min: 5, max: 136 }
            });

            if (leadEmployeeId == 'select') throw 'Please select employee';
            if (projectId == 'select') throw 'Please select project';

            if ((await Task.exists({ objective, farm_id: userInfo.farm_id })).found) throw `A task with the same objective already exists`;
            if ((await Task.exists({ lead_employee_id: leadEmployeeId, progress: { $ne: 'done' } })).found) throw `Lead employee already working on a different task`;

            await Task.insert({
                objective,
                lead_employee_id: leadEmployeeId,
                farm_id: userInfo.farm_id,
                project_id: projectId
            })

            const project = await Project.findOne({ condition: { id: projectId } });

            project.tasks_no++;
            project.status = 'ongoing';

            project.save();

            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }

    static async start (wrapRes: IResponse, body: IAny) : Promise <IResponse> {
        try {
            const { task_id } = body;
            
            Task.update({ id: task_id }, { progress: 'ongoing', startedOn: SQLDate.toSQLDatetime(new Date()) });

            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }

    static async finish (wrapRes: IResponse, body: IAny) : Promise <IResponse> {
        try {
            const { task_id } = body;
            
            const task = await Task.findOne({ condition: { id: task_id } });

            task.progress = 'done';
            task.finishedOn = SQLDate.toSQLDatetime(new Date());

            task.save()

            const project = await Project.findOne({ condition: { id: task.project_id } });

            project.tasks_completed_no++;

            if (project.tasks_no == project.tasks_completed_no) {
                project.status = 'done';

                project.save()
            }

            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }

    static async remove (wrapRes: IResponse, body: IAny) : Promise <IResponse> {
        try {
            const { task_id } = body;
            
            Task.update({ id: task_id }, { isDeleted: true });

            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }

    static async getByFarm (wrapRes: IResponse, body: IAny, { userInfo }: IAny) : Promise <IResponse> {
        try {
            if (!userInfo.department)
                wrapRes.tasks = await Task.find({
                    condition: {
                        farm_id: userInfo.farm_id,
                        isDeleted: false
                    },
                    join: [
                        {
                            ref: 'employee',
                            id: 'lead_employee_id'
                        },
                        {
                            ref: 'project',
                            id: 'project_id'
                        },
                    ]
                })

            else {

                wrapRes.tasks = await Task.find({
                    condition: {
                        farm_id: userInfo.farm_id,
                        isDeleted: false
                    },
                    join: [
                        {
                            ref: 'employee',
                            kind: 'right',
                            condition: {
                                'id': { $r: 'task.lead_employee_id' },
                                'department': userInfo.department
                            }
                        },
                        {
                            ref: 'project',
                            id: 'project_id'
                        },
                    ]
                })
            }

            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }

    static async getByProject (wrapRes: IResponse, body: IAny) : Promise <IResponse> {
        try {
            wrapRes.tasks = await Task.find({
                condition: {
                    project_id: body.project_id,
                    isDeleted: false
                },
                join: [
                    {
                        ref: 'employee',
                        id: 'lead_employee_id'
                    },
                    {
                        ref: 'project',
                        id: 'project_id'
                    },
                ]
            })


            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }
};
