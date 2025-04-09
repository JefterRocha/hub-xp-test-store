import { forwardRef, Fragment, ReactElement, Ref, SyntheticEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Slide,
    Snackbar,
    SnackbarCloseReason,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import axios from 'axios';
import { TransitionProps } from '@mui/material/transitions';


type categoryType = {
    _id: string;
    name: string;
    productsIds: string[];
}

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: ReactElement<any, any>;
    },
    ref: Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export function OrderTable() {
    const [orders, setOrders] = useState<categoryType[]>([]);

    const [toDelete, setToDelete] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string>('');
    const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:3000/orders').then((res) => setOrders(res.data));
    }, []);

    function handleAlertClose(
        _event?: SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) {
        if (reason === 'clickaway') {
            return;
        }

        setOpenAlert(false);
    };

    function handleClickOpen(id: string) {
        setOpen(true);
        setToDelete(id)
    };

    function handleClose() {
        setOpen(false);
        setToDelete(null)
    };

    async function handleDelete() {
        setLoading(true);
        try {
            await axios.delete(`http://localhost:3000/orders/${toDelete}`);
            setOrders(orders.filter((order) => order._id !== toDelete));
            setAlertMessage('Compra excluída com sucesso!');
            setAlertSeverity('success');
            setOpenAlert(true);
        } catch (error) {
            setAlertMessage('Erro ao excluir compra!');
            setAlertSeverity('error');
            setOpenAlert(true);
        }
        setOpen(false);
        setLoading(false);
    };

    return (
        <Fragment>
            <Snackbar open={openAlert} autoHideDuration={4500} onClose={handleAlertClose}>
                <Alert
                    onClose={handleAlertClose}
                    severity={alertSeverity}
                    variant='filled'
                    sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>

            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{"Confirmação de exlusão de item"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        Tem certeza que deseja excluir este item?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant='outlined'>Não</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleDelete}
                        disabled={loading}
                    >Sim</Button>
                </DialogActions>
            </Dialog>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Products</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders?.map((product: any, index: number) => (
                        <TableRow key={product._id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                                {product?.productIds
                                    .map((product: { name: string }) => product.name).join(', ')}
                            </TableCell>
                            <TableCell align="center">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<EditIcon />}
                                    component={Link}
                                    to={`/order/${product._id}`}
                                    sx={{ mr: 1 }}
                                >
                                    Editar
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => handleClickOpen(product._id)}
                                >
                                    Excluir
                                </Button>
                            </TableCell>
                        </TableRow>
                        
                    ))}
                </TableBody>
            </Table>
        </Fragment>
    );
};