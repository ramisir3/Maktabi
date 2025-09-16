import { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomSchedule from '../customSchedule/customShedule';
import moment from 'moment/moment';
import { getDeskBookings, updateDeskBookings } from '../../scripts/APIs';


export default function BookWorkspaceDeskModal(props) {
    const [modal, setModal] = useState(props.isOpen);
    const [reload, setReload] = useState(false)
    let bookings = []
    const desk = props.desk;
    const user = props.user;

    const toggle = () => setModal(!modal);

    useEffect(() => {
    }, [])

    async function getBookings() {
        return new Promise(async (res) => {
            await getDeskBookings(desk._id).then((books) => {
                books = books.data;
                for (let i in books) {
                    books[i].event_id = books[i]._id
                    books[i].color = '#449933';
                    books[i].start = new Date(books[i].start)
                    books[i].end = new Date(books[i].end)
                }
                bookings = books
                let privatedBookings = bookings
                for (let i in privatedBookings) {
                    if (privatedBookings[i].user._id != user._id) {
                        privatedBookings[i].title = 'Private';
                        privatedBookings[i].disabled = true;
                        privatedBookings[i].editable = true;
                        privatedBookings[i].deletable = true;
                        privatedBookings[i].draggable = true;
                    }
                }
                console.log(bookings, privatedBookings)
                res(privatedBookings);
            })
        });
    }

    const confirm = async () => {
        try {
            console.log(bookings)
            await updateDeskBookings(desk._id, { bookings: bookings }).then((res) => {
                toggle();
                props.modalResult({ success: true })
            })
        } catch (err) {
            toast.error('Could not book successfully')
        }
    }

    const cancel = () => {
        props.modalResult(null);
        toggle();
    }

    function onConfirm(event, action) {
        if (action == 'edit') {
            let evs = bookings;
            let index = evs.findIndex((ev) => {
                return ev.event_id == event.event_id;
            })
            evs.splice(index, 1, event);
            bookings = evs;
        } else {
            bookings = [...bookings, event]
        }
        console.log(bookings)
    }

    function onDelete(id) {
        console.log(bookings, id)
        let evs = bookings;
        let index = evs.findIndex((ev) => {
            return ev.event_id == id;
        })
        evs.splice(index, 1);
        bookings = evs
        console.log(bookings, id)
    }

    return (
        <Modal isOpen={modal} toggle={toggle} size='xl'>
            <ModalHeader toggle={toggle}>{props.title}</ModalHeader>
            <ModalBody>
                <div className='dark-green'>
                    <div className='d-flex align-items-baseline gap-2'>
                        <h3>{desk.workspace.name},</h3>
                        <h6 className='align-self-end'>{desk.workspace.location.address + ", " + desk.workspace.location.city}</h6>
                    </div>
                    <h4>Desk Name: {desk.name}</h4>
                </div>
                <div>
                    <CustomSchedule events={bookings} onConfirm={onConfirm} onDelete={onDelete}
                        onDrag={onConfirm} userBooking={true} users={desk.workspace.users} userId={user._id}
                        workspaceId={desk.workspace._id} deskId={desk._id} fetchEvents={getBookings}></CustomSchedule>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="#449933" onClick={() => { confirm() }}>
                    Confirm
                </Button>{' '}
                <Button color="white" onClick={() => { cancel() }}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    )
}