import { useState, useEffect } from 'react';
import PolicyForm from '../components/PolicyForm';
import { QRCodeCanvas } from 'qrcode.react';

export default function Policies() {
    const [policies, setPolicies] = useState([]);
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [qrData, setQrData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = 'http://localhost:3001';
    const CURRENT_TENANT_ID = 1;

    const fetchPolicies = () => {
        setQrData(null);
        fetch(`${API_BASE_URL}/api/tenants/${CURRENT_TENANT_ID}/policies`)
            .then(res => {
                if (!res.ok) throw new Error('Error al cargar políticas');
                return res.json();
            })
            .then(data => {
                setPolicies(data);
                setLoading(false);
            })
            .catch(() => {
                setError('No se pudo conectar al servidor backend.');
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const generateQr = async (policyId) => {
        setQrData(null);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/tenants/${CURRENT_TENANT_ID}/enrollment-tokens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ policy_id: policyId }),
            });
            const data = await response.json();
            if (response.ok) {
                setQrData(data.qrCode);
            } else {
                setError(data.error || 'Error al generar QR.');
            }
        } catch (e) {
            setError('Error de conexión.');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Políticas</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lista de Políticas */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Políticas Existentes</h2>
                    {loading ? <p>Cargando...</p> : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {policies.map(policy => (
                                        <tr key={policy.id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{policy.name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => generateQr(policy.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    QR
                                                </button>
                                                <button
                                                    onClick={() => { setEditingPolicy(policy); setQrData(null); }}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {qrData && (
                        <div className="mt-6 text-center border-t pt-4">
                            <h4 className="text-sm font-bold text-gray-600 mb-2">Escanea este QR para enrolar</h4>
                            <div className="flex justify-center">
                                <QRCodeCanvas value={qrData} size={200} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Formulario */}
                <div>
                    <PolicyForm
                        tenantId={CURRENT_TENANT_ID}
                        editingPolicy={editingPolicy}
                        clearEditing={() => setEditingPolicy(null)}
                        onFormSubmit={fetchPolicies}
                    />
                </div>
            </div>
        </div>
    );
}
