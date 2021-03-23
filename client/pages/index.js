import { Fragment, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import moment from 'moment';
import Link from 'next/link';
import { API } from '../config';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';

//fully tested (unauthenticated, authenticated user, authenticated admin)

const Home = ({ categories }) => {
	const [popular, setPopular] = useState([]);

	useEffect(() => {
		loadPopular();
	}, []);

	const loadPopular = async () => {
		const response = await axios.get(`${API}/link/popular`);
		// console.log(response);
		setPopular(response.data);
	};

	const handleClick = async (linkId) => {
		const response = await axios.put(`${API}/link/click-count`, { linkId });
		loadPopular();
	};

	const listOfLinks = () =>
		popular.map((l, i) => (
			<Row key={i} className="alert alert-secondary p-2">
				<Col md={8} onClick={() => handleClick(l._id)}>
					<a href={l.url} target="_blank">
						<h5 className="pt-2">{l.title}</h5>
						<h6 className="pt-2 text-danger" style={{ fontSize: '12px' }}>
							{l.url}
						</h6>
					</a>
				</Col>

				<Col md={4} className="pt-2">
					<span className="pull-right">
						{moment(l.createdAt).fromNow()} by {l.postedBy.name}
					</span>
				</Col>

				<Col md={12}>
					<span className="badge text-dark">
						{l.type} {l.medium}
					</span>
					{l.categories.map((c, i) => (
						<span key={i} className="badge text-success">
							{c.name}
						</span>
					))}
					<span className="badge text-secondary pull-right">
						{l.clicks} clicks
					</span>
				</Col>
			</Row>
		));

	const listCategories = () =>
		categories.map((c, i) => (
			<Col md={4} style={{ padding: '1rem' }}>
				<Card style={{ flex: 1 }} key={i}>
					<Card.Img
						variant="top"
						src={c.image && c.image.url}
						alt={c.name}
						style={{ margin: 'auto', width: '100px', height: '100px' }}
					/>
					<Card.Body>
						<Link key={i} href={`/links/${c.slug}`}>
							<Card.Title as="a">{c.name}</Card.Title>
						</Link>
						<Card.Text>
							This is a wider card with supporting text below as a natural
							lead-in to additional content. This content is a little bit
							longer.
						</Card.Text>
					</Card.Body>
					<Card.Footer>
						<small className="text-muted">Last updated 3 mins ago</small>
					</Card.Footer>
				</Card>
			</Col>
		));

	return (
		<Layout>
			<Container>
				<Row>
					<Col md={12}>
						<h1 className="font-weight-bold">Browse Categories</h1>
						<br />
					</Col>
				</Row>

				<CardGroup style={{ display: 'flex' }}>{listCategories()}</CardGroup>

				<Row>
					<h2 className="font-weight-bold pb-3">Trending {popular.length}</h2>
					{
						<Col md={12} className="overflow-hidden">
							{listOfLinks()}
						</Col>
					}
				</Row>
			</Container>
		</Layout>
	);
};

Home.getInitialProps = async () => {
	const response = await axios.get(`${API}/category/categories`);
	return {
		categories: response.data,
	};
};

export default Home;
