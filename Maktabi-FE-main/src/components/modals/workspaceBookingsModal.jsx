import { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Table, Input } from 'reactstrap';
import { deleteBookingsById, getDesksByWorkspaceId, getUserBookings, getWorkspaceBookings } from '../../scripts/APIs';
import moment from 'moment/moment';
import { Tooltip, Button } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DatePicker } from '@mui/x-date-pickers';


export default function ViewWSBookingsModal(props) {
    const [modal, setModal] = useState(props.isOpen);
    const [infoModal, setInfoModal] = useState(false)
    const [bookingInfo, setBookingInfo] = useState(null)
    const [events, setEvents] = useState([])
    const [allEvents, setAllEvents] = useState([])
    const [filteredEvents, setFilteredEvents] = useState([])
    const [selectedFloor, setSelectedFloor] = useState('none')
    const [floorDesks, setFloorDesks] = useState([])
    const [selectedDesk, setSelectedDesk] = useState('none')
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [timing, setTiming] = useState('past')

    useEffect(() => {
        getUserEvents()
    }, [])

    async function getUserEvents() {
        await getWorkspaceBookings(props.workspace._id).then((res) => {
            let bookings = res.data;
            setAllEvents(bookings)
        })
    }

    async function deleteBooking(event) {
        try {
            await deleteBookingsById(event._id).then((res) => {
                toast.success('Deleted booking successfully')
                getUserEvents()
            })
        } catch (err) {
            toast.error("Could not delete this booking, try again later.")
            console.error(err)
        }
    }

    useEffect(() => {
        let filteredBookings = allEvents.filter((book) => {
            return timing == 'past' ? moment(book.start).isBefore(moment()) : moment(book.start).isAfter(moment());
        })
        console.log(filteredBookings)
        filteredBookings = filteredBookings.sort((item1, item2) => {
            return timing == 'past' ? moment(item1.start).isBefore(moment(item2.start)) ? 1 : -1
                : moment(item1.start).isBefore(moment(item2.start)) ? -1 : 1
        })
        console.log(filteredBookings)
        setEvents(filteredBookings)
    }, [allEvents.length, timing])

    useEffect(() => {
        filterBookings();
    }, [events.length, selectedFloor, selectedDesk, startDate, endDate])

    function filterBookings() {
        let filteredList = events.filter((ev) => {
            if (selectedFloor != 'none' && ev.desk.floor != selectedFloor) {
                return false;
            }
            if (selectedDesk != 'none' && ev.desk._id != selectedDesk) {
                return false;
            }
            if (startDate && moment(startDate).isAfter(moment(ev.start))) {
                return false
            }
            if (endDate && moment(endDate).isBefore(moment(ev.end).subtract('1', 'day'))) {
                return false
            }
            return true;
        })
        setFilteredEvents(filteredList)
    }

    const toggle = () => setModal(!modal);
    const toggleInfo = () => setInfoModal(!infoModal);

    function closeInfoModal() {
        toggleInfo()
        setBookingInfo(null)
    }

    function showBookingInfo(event) {
        setBookingInfo(event);
        setInfoModal(!infoModal)
    }

    async function handleFetchDesks(floorNumber) {
        await getDesksByWorkspaceId(props.workspace._id).then((res) => {
            let desks = res.data;
            desks = desks.filter((desk) => {
                return desk.floor == floorNumber;
            })
            setFloorDesks(desks)
        })
    }

    function resetFilters() {
        setTiming('past')
        setSelectedFloor('none')
        setSelectedDesk('none')
        setStartDate(null)
        setEndDate(null)
    }

    const cancel = () => {
        props.modalResult(null);
        toggle();
    }

    return (<>
        <Modal isOpen={modal} toggle={toggle} size='xl'>
            <ToastContainer />
            <ModalHeader toggle={cancel}>{props.title}</ModalHeader>
            <ModalBody>
                <div className='d-flex gap-1'>
                    <Input
                        id='pastFuture'
                        name='pastFuture'
                        value={timing}
                        type='select'
                        onChange={(e) => { setTiming(e.target.value) }}
                    >
                        <option value={'past'}>
                            Past Events
                        </option>
                        <option value={'future'}>
                            Future Events
                        </option>
                    </Input>
                    <Input
                        id='floorSelect'
                        name='floorSelect'
                        type='select'
                        value={selectedFloor}
                        onChange={(e) => { setSelectedFloor(e.target.value); handleFetchDesks(e.target.value) }}
                    >
                        <option value={'none'}>
                            Choose Floor
                        </option>
                        {props.workspace && props.workspace.floors && props.workspace.floors.length > 0 && props.workspace.floors.map((floor) => {
                            return <option value={floor.floorNumber}>
                                {floor.floorNumber}
                            </option>
                        })}
                    </Input>
                    <Input
                        id='deskSelect'
                        name='deskSelect'
                        type='select'
                        value={selectedDesk}
                        onChange={(e) => { setSelectedDesk(e.target.value) }}
                    >
                        <option value={'none'}>
                            Choose Desk
                        </option>
                        {floorDesks && floorDesks.length > 0 && floorDesks.map((desk) => {
                            return <option value={desk._id}>
                                {desk.name}
                            </option>
                        })}
                    </Input>
                </div>
                <div className='d-flex gap-1 justify-content-center mt-3' style={{ height: '40px' }}>
                    <DatePicker value={startDate} slotProps={{ textField: { size: 'small' } }}
                        onChange={(newValue) => setStartDate(newValue)} label={'Start date'} />
                    <DatePicker value={endDate}
                        onChange={(newValue) => setEndDate(newValue)} label={'End date'} slotProps={{ textField: { size: 'small' } }} />
                    <Button variant="contained" sx={{ backgroundColor: '#449933' }} onClick={() => { resetFilters() }}>
                        Reset filters
                    </Button>
                </div>
                {infoModal && bookingInfo && <Modal isOpen={infoModal} toggle={toggleInfo} size='md'>
                    <ModalHeader toggle={closeInfoModal}>booking info</ModalHeader>
                    <ModalBody>
                        <Table
                            bordered
                            hover
                            responsive
                            size=""
                            striped>
                            <thead>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        User
                                    </td>
                                    <td>
                                        {bookingInfo.user.firstName + ' ' + bookingInfo.user.lastName}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Floor
                                    </td>
                                    <td>
                                        {bookingInfo.desk.floor}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Desk
                                    </td>
                                    <td>
                                        {bookingInfo.desk.name}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Start
                                    </td>
                                    <td>
                                        {moment(bookingInfo.start).format('MMM DD, YYYY hh:mm a')}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        End
                                    </td>
                                    <td>
                                        {moment(bookingInfo.end).format('MMM DD, YYYY hh:mm a')}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Description
                                    </td>
                                    <td>
                                        {bookingInfo.description}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Other members
                                    </td>
                                    <td>
                                        {bookingInfo.users && bookingInfo.users.length > 0 && bookingInfo.users.map((user) => {
                                            return <div>{user.email + '   '}</div>
                                        })}
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </ModalBody>
                    <ModalFooter>
                        <Button sx={{ color: '#449933' }} onClick={() => { closeInfoModal() }}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>}
                <div className='mt-1'>
                    <Table
                        bordered
                        hover
                        responsive
                        size=""
                        striped>
                        <thead>
                            <tr>
                                <th>
                                    Start time
                                </th>
                                <th>
                                    End Time
                                </th>
                                <th>
                                    Title
                                </th>
                                <th>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents && filteredEvents.map((event) => {
                                return (
                                    <tr>
                                        <td>
                                            {moment(event.start).format('MMM DD, YYYY hh:mm a')}
                                        </td>
                                        <td>
                                            {moment(event.end).format('MMM DD, YYYY hh:mm a')}
                                        </td>
                                        <td>
                                            {event.title}
                                        </td>
                                        <td className='d-flex justify-content-center align-items-center gap-2'>
                                            {<Tooltip title="View Booking" key={"view"}><span onClick={() => { showBookingInfo(event) }} style={{ cursor: "pointer" }}> <i className="fa-solid fa-eye fa-xl"></i></span></Tooltip>}
                                            {timing == 'future' && <Tooltip title="Delete Booking" key={"del"}><span onClick={() => { deleteBooking(event) }} style={{ color: 'red', cursor: "pointer" }}> <i className="fa-solid fa-circle-xmark fa-xl"></i></span></Tooltip>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button sx={{ color: '#449933' }} onClick={() => { cancel() }}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    </>
    )
}