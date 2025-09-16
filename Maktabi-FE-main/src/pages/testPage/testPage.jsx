import { useEffect, useState } from "react";
import CustomSchedule from "../../components/customSchedule/customShedule";


export default function TestComp(props) {
    const [reload, setReload] = useState(false)
    let events = []

    useEffect(() => {
        events = EVENTS;
    }, [])

    useEffect(() => {
        setReload((prev) => !prev)
    }, [events.length])

    const users = [
        {
            id: 1,
            name: 'rami',
            email: 'ramisir@gmail.com'
        },
        {
            id: 2,
            name: 'rami1',
            email: 'ramisir1@gmail.com'
        },
        {
            id: 3,
            name: 'rami2',
            email: 'ramisir2@gmail.com'
        }
    ]
    function onConfirm(event, action) {
        if (action == 'edit') {
            let evs = events;
            let index = evs.findIndex((ev) => {
                return ev.event_id == event.event_id;
            })
            evs.splice(index, 1, event);
            events = evs;
        } else {
            events = [...events, event]
        }
        console.log(events, EVENTS, event, action)
    }


    function onDelete(id) {
        console.log(events, id)
        let evs = events;
        let index = evs.findIndex((ev) => {
            return ev.event_id == id;
        })
        evs.splice(index, 1);
        setReload((prev) => !prev)
        console.log(events, id)
    }

    return <CustomSchedule events={EVENTS} onConfirm={onConfirm} onDelete={onDelete}
        onDrag={onConfirm} isPrivate={true} users={users} userId={'123'}
        workspaceId={'3424242'} deskId={'623746'} />
}


var EVENTS = [
    {
        event_id: 1,
        title: "Event 1",
        start: new Date(new Date(new Date().setHours(9)).setMinutes(0)),
        end: new Date(new Date(new Date().setHours(10)).setMinutes(0)),
        disabled: true,
        admin_id: [1, 2, 3, 4]
    },
    {
        event_id: 2,
        title: "Event 2",
        start: new Date(new Date(new Date().setHours(10)).setMinutes(0)),
        end: new Date(new Date(new Date().setHours(12)).setMinutes(0)),
        admin_id: 2,
        color: "#50b500"
    },
    {
        event_id: 3,
        title: "Event 3",
        start: new Date(new Date(new Date().setHours(11)).setMinutes(0)),
        end: new Date(new Date(new Date().setHours(12)).setMinutes(0)),
        admin_id: 1,
        editable: false,
        deletable: false
    },
    {
        event_id: 4,
        title: "Event 4",
        start: new Date(
            new Date(new Date(new Date().setHours(9)).setMinutes(30)).setDate(
                new Date().getDate() - 2
            )
        ),
        end: new Date(
            new Date(new Date(new Date().setHours(11)).setMinutes(0)).setDate(
                new Date().getDate() - 2
            )
        ),
        admin_id: 2,
        color: "#900000"
    },
    {
        event_id: 5,
        title: "Event 5",
        start: new Date(
            new Date(new Date(new Date().setHours(10)).setMinutes(30)).setDate(
                new Date().getDate() - 2
            )
        ),
        end: new Date(
            new Date(new Date(new Date().setHours(14)).setMinutes(0)).setDate(
                new Date().getDate() - 2
            )
        ),
        admin_id: 2,
        editable: true
    },
    {
        event_id: 6,
        title: "Event 6",
        start: new Date(
            new Date(new Date(new Date().setHours(10)).setMinutes(30)).setDate(
                new Date().getDate() - 4
            )
        ),
        end: new Date(new Date(new Date().setHours(14)).setMinutes(0)),
        admin_id: 2
    }
];
