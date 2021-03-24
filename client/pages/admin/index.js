import Layout from '../../components/Layout';
import withAdmin from '../withAdmin';
import Link from 'next/link';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Admin = ({ user }) => (
	<Layout>
		<h1>Admin Dashboard</h1>
		<br />
		<Row className="row">
			<Col md={4}>
				<ul>
					<li>
						<a href="/admin/category/create">Create category</a>
					</li>
					<li>
						<Link href="/admin/category/read">
							<a>All categories</a>
						</Link>
					</li>
					<li>
						<Link href="/admin/link/read">
							<a>All Links</a>
						</Link>
					</li>
					<li>
						<Link href="/user/profile/update">
							<a>Profile update</a>
						</Link>
					</li>
				</ul>
			</Col>
			<Col md={8}>
				{' '}
				Stuff to go here --- links are currently working but need to read up on
				nextjs link syntax{' '}
			</Col>
		</Row>
	</Layout>
);

export default withAdmin(Admin);
