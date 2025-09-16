import { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { deleteUserById } from '../../scripts/APIs';


export default function UserActionModal(props) {
    const [modal, setModal] = useState(props.isOpen);

    const toggle = () => setModal(!modal);


    const confirm = async () => {
        //perform action
        let promise;
        switch (props.action) {
            case "activate":
                promise = true; //do action
                props.modalResult({ id: props.userID, name: props.userName, success: promise });
                break;
            case "deactivate":
                promise = false; //do action
                props.modalResult({ id: props.userID, name: props.userName, success: promise });
                break;
            case "delete":
                try {
                    await deleteUserById(props.userID).then((res) => {
                        props.modalResult({ id: props.userID, name: props.userName, success: true });
                    })
                } catch (err) {
                    props.modalResult({ id: props.userID, name: props.userName, success: false });
                }
                break;
        }
        toggle();
    }

    const cancel = () => {
        props.modalResult(null);
        toggle();
    }

    return (
        <Modal isOpen={modal} toggle={toggle}>
            <ModalHeader toggle={toggle}>{props.title}</ModalHeader>
            <ModalBody>
                {"Are you sure you want to " + props.action + " " + props.userName + " account?"}

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