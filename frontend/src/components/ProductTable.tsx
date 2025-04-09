import { forwardRef, useEffect, useState, Ref, SyntheticEvent, Fragment, ReactElement } from 'react';
import { Link } from 'react-router-dom';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Link as MUILink,
    Button,
    Alert,
    Snackbar,
    SnackbarCloseReason
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';

import axios from 'axios';

type productType = {
    _id: string;
    name: string;
    price: number;
    description: string;
};

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: ReactElement<any, any>;
    },
    ref: Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});


export function ProductTable() {
    const [products, setProducts] = useState<productType[]>([]);
    const [toDelete, setToDelete] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string>('');
    const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
    const [loading, setLoading] = useState(false);

    function handleAlertClose(
        _event?: SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) {
        if (reason === 'clickaway') {
            return;
        }

        setOpenAlert(false);
    };

    const handleClickOpen = (id: string) => {
        setOpen(true);
        setToDelete(id)
    };

    const handleClose = () => {
        setOpen(false);
        setToDelete(null)
    };


    function parseCurrency(value: number) {
        const config: Intl.NumberFormatOptions = { style: 'currency', currency: 'BRL' };
        return new Intl.NumberFormat("pt-BR", config).format(value);
    }

    async function handleDelete() {
        setLoading(true);
        try {
            await axios.delete(`http://localhost:3000/products/${toDelete}`);
            setProducts(products.filter((product) => product._id !== toDelete));
            setAlertMessage('Produto excluído com sucesso!');
            setAlertSeverity('success');
            setOpenAlert(true);
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            setAlertMessage('Erro ao excluir produto!');
            setAlertSeverity('error');
            setOpenAlert(true);
        }
        setOpen(false);
        setLoading(false);
    };

    useEffect(() => {
        axios.get('http://localhost:3000/products').then((res) => setProducts(res.data));
    }, []);

    return (<Fragment>
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
            <DialogTitle>{"Confirmação de exlusão de produto"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    Tem certeza que deseja excluir este produto?
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
                    <TableCell>Nome</TableCell>
                    <TableCell>Preço</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell align="center">Imagem</TableCell>
                    <TableCell align="center">Ações</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {products.map((product: any) => (
                    <TableRow key={product._id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{parseCurrency(product.price)}</TableCell>
                        <TableCell>{product.description}</TableCell>
                        <TableCell>
                        <MUILink href={product?.imageUrl?.replace('localstack', 'localhost')} target="_blank" rel="noopener noreferrer">
                            {product?.imageUrl?.substr(0, 40)}...
                        </MUILink>
                        </TableCell>
                        <TableCell align="center">
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<EditIcon />}
                                component={Link}
                                to={`/product/${product._id}`}
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