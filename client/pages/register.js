import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Router from 'next/router';
import axios from 'axios';
import { showSuccessMessage, showErrorMessage } from '../helpers/alerts';
import { API } from '../config';
import { isAuth } from '../helpers/auth';

import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const Register = () => {
	const [state, setState] = useState({
		name: '',
		email: '',
		password: '',
		error: '',
		success: '',
	});

	const { name, email, password, error, success } = state;

	useEffect(() => {
		isAuth() && Router.push('/');
	}, []);

	const onChange = (e) =>
		setState({ ...state, [e.target.name]: e.target.value });

	const onSubmit = async (e) => {
		e.preventDefault();
		setState({ ...state });
		try {
			await axios.post(`${API}/auth/register`, {
				name,
				email,
				password,
			});
			// setState({
			// 	...state,
			// 	name: '',
			// 	email: '',
			// 	password: '',
			// 	success: response.data.message,
			// });
		} catch (error) {
			console.log(error);
			setState({
				...state,
				error: error.response.data.error,
			});
		}
	};

	const registrationForm = () => (
		<Form onSubmit={onSubmit}>
			<Form.group>
				<Form.Label>Full Name</Form.Label>
				<Form.Control
					value={name}
					name="name"
					onChange={onChange}
					type="text"
					placeholder="enter your full name..."
					required
				/>
			</Form.group>
			<br />
			<Form.group>
				<Form.Label>Email</Form.Label>
				<Form.Control
					value={email}
					name="email"
					onChange={onChange}
					type="text"
					placeholder="enter your address..."
					required
				/>
			</Form.group>
			<br />
			<Form.group>
				<Form.Label>Password</Form.Label>
				<Form.Control
					value={password}
					name="password"
					onChange={onChange}
					type="text"
					placeholder="enter your password..."
					required
				/>
			</Form.group>
			<br />
			<Form.Group>
				<Button className="btn" name="submit" type="submit" value="Register">
					Register
				</Button>
			</Form.Group>
		</Form>
	);

	return (
		<Layout>
			<Col md={6} className="offset-md-3">
				<h1>Register</h1>
				<br />
				{success && showSuccessMessage(success)}
				{error && showErrorMessage(error)}
				{registrationForm()}
			</Col>
		</Layout>
	);
};

export default Register;
