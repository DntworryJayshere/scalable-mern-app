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
			<Row key={i} className="alert alert-primary">
				<Col md={8}>
					<h5>Title: {l.title}</h5>

					<h6 onClick={() => handleClick(l._id)} style={{ fontSize: '1rem' }}>
						Main Url: {'   '}
						<a href={l.url} target="_blank">
							{l.url}
						</a>
					</h6>

					<h6 style={{ fontSize: '1rem' }}>
						Supplemental Url: {'   '}
						<a href={l.url2} target="_blank">
							{l.url2}
						</a>
					</h6>
					<p>Short Description: {l.shortdescription}</p>
				</Col>
				<Col md={4} style={{ textAlign: 'right' }}>
					<span>
						{moment(l.createdAt).fromNow()} by {l.postedBy.name}
					</span>
				</Col>
				<Row>
					<Col md={12}>
						<p className="text-dark" style={{ fontSize: '.9rem' }}>
							<div>
								Type: {'   '}
								{l.type}
							</div>
							<div>
								Categories: {'   '}
								{l.categories.map((c, i) => (
									<span key={i}>
										{c.name} , {'   '}
									</span>
								))}
							</div>
						</p>
					</Col>
					<Col md={8}>
						<span className="text-secondary" style={{ textAlign: 'left' }}>
							{l.clicks} clicks
						</span>{' '}
					</Col>
				</Row>
			</Row>
		));

	const listCategories = () =>
		categories.map((c, i) => (
			<Col key={i} md={4} style={{ padding: '1rem' }}>
				<Card style={{ flex: 1 }} key={i}>
					<Card.Img
						variant="top"
						src={c.image && c.image.url}
						alt={c.name}
						style={{ margin: 'auto', width: '100px', height: '100px' }}
					/>
					<Card.Body>
						<Card.Text>
							<div>{c.content}</div>
						</Card.Text>
					</Card.Body>
					<Card.Footer>
						<Link href={`/links/${c.slug}`}>
							<Card.Title as="a" style={{ cursor: 'pointer' }}>
								{c.name}
							</Card.Title>
						</Link>
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
