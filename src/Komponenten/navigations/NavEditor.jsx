import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NavUser({ role }) {
  return (
    <Nav className="ms-auto fs-6">
<Nav.Item>
            <Nav.Link as={Link} to="/notifications" className="text-grey disabled font-weight-light">
            <i className="bi bi-bell"></i>  {/* Bootstrap Icon für Benachrichtigungen */}
            
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/messages" className="text-grey disabled font-weight-light">
            <i className="bi bi-chat"></i>  {/* Bootstrap Icon für Nachrichten */}
            
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/calendar" className="text-grey disabled font-weight-light">
            <i className="bi bi-calendar"></i>  {/* Bootstrap Icon für Kalender */}
            
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/tasks" className="text-grey disabled font-weight-light">
            <i className="bi bi-check-square"></i>  {/* Bootstrap Icon für Aufgaben */}
            
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/files" className="text-grey disabled font-weight-light">
            <i className="bi bi-file-earmark"></i>  {/* Bootstrap Icon für Dateien */}
            
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/contacts" className="text-grey disabled font-weight-light">
            <i className="bi bi-person-lines-fill"></i>  {/* Bootstrap Icon für Kontakte */}
            
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/reports" className="text-grey disabled font-weight-light">
            <i className="bi bi-file-earmark-bar-graph"></i>  {/* Bootstrap Icon für Berichte */}
            
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/analytics" className="text-grey disabled font-weight-light">
            <i className="bi bi-graph-up-arrow"></i>  {/* Bootstrap Icon für Analysen */}
            
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/support" className="text-grey disabled font-weight-light">
            <i className="bi bi-headset"></i>  {/* Bootstrap Icon für Support */}
            
            </Nav.Link>
        </Nav.Item>
           </Nav>
        );
      }
      
      export default NavEditor;