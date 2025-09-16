import { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { updateWorkspaceById } from '../../scripts/APIs';


export default function WorkspaceActionModal(props) {
    const [modal, setModal] = useState(props.isOpen);

    const toggle = () => setModal(!modal);


    const confirm = async () => {
        //perform action
        let promise;
        switch (props.action) {
            case "activate":
                try {
                    await updateWorkspaceById(props.workspaceID, { 'active': true }).then(res => {
                        props.modalResult({ id: props.workspaceID, name: props.workspaceName, success: true });
                        toggle();
                    })
                } catch (err) {
                    console.log(err)
                    toast.error("Failed to activate workspace");
                }
                break;
            case "deactivate":
                try {
                    await updateWorkspaceById(props.workspaceID, { 'active': false }).then(res => {
                        props.modalResult({ id: props.workspaceID, name: props.workspaceName, success: true });
                        toggle();
                    })
                } catch (err) {
                    toast.error("Failed to deactivate workspace");
                }
                break;
            case "delete":
                promise = true; //do action
                props.modalResult({ id: props.workspaceID, name: props.workspaceName, success: promise });
                break;
        }
    }

    const cancel = () => {
        props.modalResult(null);
        toggle();
    }

    return (
        <Modal isOpen={modal} toggle={toggle}>
            <ToastContainer />
            <ModalHeader toggle={toggle}>{props.title}</ModalHeader>
            <ModalBody>
                {"Are you sure you want to " + props.action + " the " + props.workspaceName + " workspace?"}

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