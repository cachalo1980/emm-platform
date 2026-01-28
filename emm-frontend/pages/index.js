export default function Dashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Panel de Control EMM</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                    <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Estado del Sistema</h2>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">Activo</p>
                    <p className="mt-1 text-sm text-green-600">Servicios operativos</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
                    <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Cliente (Tenant)</h2>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">#1</p>
                    <p className="mt-1 text-sm text-gray-500">Mi Empresa (Admin)</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Acciones Rápidas</h2>
                    <div className="mt-4 space-y-2">
                        <a href="/policies" className="block text-center bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 rounded text-sm font-medium">
                            Crear Nueva Política
                        </a>
                        <a href="/devices" className="block text-center bg-gray-50 text-gray-700 hover:bg-gray-100 py-2 rounded text-sm font-medium">
                            Ver Dispositivos
                        </a>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900">Bienvenido al EMM Admin Panel</h3>
                <p className="mt-2 text-blue-700">
                    Utiliza el menú lateral para navegar entre tus dispositivos y gestionar las políticas de seguridad de Android Enterprise.
                </p>
            </div>
        </div>
    );
}