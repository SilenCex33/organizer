import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NavUser({ role }) {
  return (
    <Nav className="ms-auto fs-6">
      <Nav.Item>
      <Nav.Link as={Link} to="/user-dashboard" className="text-white font-wight-light  ">
        <i className="bi bi-house-door"></i>  {/* Bootstrap Icon für Home */}
         
      </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/profile" className="text-grey disabled font-weight-light">
          <i className="bi bi-person-circle"></i>  {/* Bootstrap Icon für Profil */}
          
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/settings" className="text-grey disabled font-weight-light">
          <i className="bi bi-gear"></i>  {/* Bootstrap Icon für Einstellungen */}
          
        </Nav.Link>
      </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/logout" className="text-grey disabled font-weight-light">
            <i className="bi bi-box-arrow-right"></i>  {/* Bootstrap Icon für Logout */}
            
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/help" className="text-grey disabled font-weight-light">
            <i className="bi bi-question-circle"></i>  {/* Bootstrap Icon für Hilfe */}
            
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/feedback" className="text-grey disabled font-weight-light">
            <i className="bi bi-chat-dots"></i>  {/* Bootstrap Icon für Feedback */}
            
            </Nav.Link>
        </Nav.Item>
        
    </Nav>
  );
}

export default NavUser;

