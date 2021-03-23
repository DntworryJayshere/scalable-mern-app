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
		loadedCategories: [],
		categories: [],
	});

	const {
		name,
		email,
		password,
		error,
		success,
		loadedCategories,
		categories,
	} = state;

	useEffect(() => {
		isAuth() && Router.push('/');
	}, []);

	// load categories when component mounts using useEffect
	useEffect(() => {
		loadCategories();
	}, []);

	const loadCategories = async () => {
		const response = await axios.get(`${API}/category/categories`);
		setState({ ...state, loadedCategories: response.data });
	};

	const handleToggle = (c) => () => {
		// return the first index or -1
		const clickedCategory = categories.indexOf(c);
		const all = [...categories];

		if (clickedCategory === -1) {
			all.push(c);
		} else {
			all.splice(clickedCategory, 1);
		}
		console.log('all >> categories', all);
		setState({ ...state, categories: all, success: '', error: '' });
	};

	// show categories > checkbox
	const showCategories = () => {
		return (
			loadedCategories &&
			loadedCategories.map((c, i) => (
				<li className="list-unstyled" key={c._id}>
					<input
						type="checkbox"
						onChange={handleToggle(c._id)}
						className="mr-2"
					/>
					<label className="form-check-label">{c.name}</label>
				</li>
			))
		);
	};

	const onChange = (e) =>
		setState({ ...state, [e.target.name]: e.target.value });

	const onSubmit = async (e) => {
		e.preventDefault();
		setState({ ...state });
		console.table({
			name,
			email,
			password,
			categories,
		});
		try {
			const response = await axios.post(`${API}/auth/register`, {
				name,
				email,
				password,
				categories,
			});
			console.log(response);
			setState({
				...state,
				name: '',
				email: '',
				password: '',
				success: response.data.message,
			});
		} catch (error) {
			console.log(error);
			setState({
				...state,
				error: error.response.data.error,
			});
		}
	};

	const registerForm = () => (
		<Form onSubmit={onSubmit}>
			<Form.group>
				<Form.Label>Full Name</Form.Label>
				<Form.Control
					value={name}
					name="name"
					onChange={onChange}
					type="text"
					placeholder="enter your full name"
					required
				/>
			</Form.group>
			<Form.group>
				<Form.Label>Email</Form.Label>
				<Form.Control
					value={email}
					name="email"
					onChange={onChange}
					type="text"
					placeholder="enter your email"
					required
				/>
			</Form.group>
			<Form.group>
				<Form.Label>Password</Form.Label>
				<Form.Control
					value={password}
					name="password"
					onChange={onChange}
					type="text"
					placeholder="enter your password"
					required
				/>
			</Form.group>
			<Form.group>
				<Form.Label>Category</Form.Label>
				<ul style={{ maxHeight: '100px', overflowY: 'scroll' }}>
					{showCategories()}
				</ul>
			</Form.group>
			<Form.Group>
				<Button className="btn" name="submit" type="submit" value="Register">
					Register
				</Button>
			</Form.Group>
		</Form>
	);

	return (
		<Layout>
			<Col className="offset-md-3">
				<h1>Register</h1>
				<br />
				{success && showSuccessMessage(success)}
				{error && showErrorMessage(error)}
				{registerForm()}
			</Col>
		</Layout>
	);
};

export default Register;
