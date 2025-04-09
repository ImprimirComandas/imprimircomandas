import { Link } from 'react-router-dom';

export function Sidebar() {
  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Menu</h1>
      </div>
      <nav className="mt-4">
        <ul>
          <li className="p-2 hover:bg-gray-700">
            <Link to="/reset-password">Redefinir Senha</Link>
          </li>
          <li className="p-2 hover:bg-gray-700">
            <Link to="/products">Produtos</Link>
          </li>
          <li className="p-2 hover:bg-gray-700">
            <Link to="/delivery-app">Delivery</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
