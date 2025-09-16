import { useEffect, useState } from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import moment from "moment/moment";


export default function CustomSchedule(props) {

    let fields =
        [
            {
                name: "Description",
                type: "input",
                default: "Description...",
                config: { label: "Details", multiline: true, rows: 4 }
            },
            {
                name: 'user',
                type: 'hidden',
                default: props.userId
            },
            {
                name: 'workspace',
                type: 'hidden',
                default: props.workspaceId
            },
            {
                name: 'desk',
                type: 'hidden',
                default: props.deskId
            }
        ]
    if (props.isPrivate) {
        fields.unshift({
            name: "users",
            type: "select",

            // Should provide options with type:"select"
            options: props.users.map((user) => {
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    text: user.email,
                    value: user,
                }
            }),
            config: { multiple: "chips", label: "User", required: true, errMsg: "Please select at least one user" }
        },)
    }

    async function handleChange(event, action) {
        // console.log(event, action)
        event.color = '#449933'
        event.event_id = event.event_id || Math.random()
        if (!handleOverlap(event)) {
            return new Promise((res, rej) => {
                props.onConfirm(event, action)
                res({
                    ...event,
                });
            });
        }
    }

    function handleOverlap(event) {
        let doesOverlap = false;
        for (let i in props.events) {
            console.log(props.events[i])
            if (props.events[i].event_id != event.event_id) {
                if ((moment(props.events[i].start).isAfter(moment(event.start)) && moment(props.events[i].start).isBefore(moment(event.end))
                    && moment(props.events[i].end).isAfter(moment(event.end)))
                    || (moment(props.events[i].end).isAfter(moment(event.start)) && moment(props.events[i].end).isBefore(moment(event.end))
                        && moment(props.events[i].start).isBefore(moment(event.start)))) {
                    console.log("overlap")
                    doesOverlap = true;
                    break;
                }
            }
        }
        return doesOverlap;
    }

    async function handleDrag(droppedOn, updatedEvent, originalEvent) {
        // console.log(event, action)
        updatedEvent.color = '#449933'
        updatedEvent.event_id = updatedEvent.event_id || Math.random()
        if (!handleOverlap(updatedEvent)) {
            return new Promise((res, rej) => {
                props.onDrag(updatedEvent, 'edit')
                res({
                    ...updatedEvent,
                });
            });
        }
    }

    const handleDelete = async (deletedId) => {
        // Simulate http request: return the deleted id
        return new Promise((res, rej) => {
            props.onDelete(deletedId)
            res(deletedId);
        });
    };


    return <Scheduler
        getRemoteEvents={props.fetchEvents}
        day={{
            startHour: 7,
            endHour: 23,
            step: 60,
        }}
        week={{
            startHour: 7,
            endHour: 23,
            step: 60,
        }}
        onConfirm={props.viewOnly ? null : handleChange}
        onDelete={props.viewOnly ? null : handleDelete}
        onEventDrop={props.viewOnly ? null : handleDrag}
        fields={fields}
        draggable={!props.viewOnly}
        editable={!props.viewOnly}
        view='day'
    />;
}
