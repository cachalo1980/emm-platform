import { useState, useEffect } from 'react';

export default function PolicyForm({ tenantId, onFormSubmit, editingPolicy, clearEditing }) {
    const [name, setName] = useState('');
    const [googleId, setGoogleId] = useState('');
    const [cameraDisabled, setCameraDisabled] = useState(false);
    const [screenCaptureDisabled, setScreenCaptureDisabled] = useState(true);
    const [applications, setApplications] = useState([]);
    const [newAppPackage, setNewAppPackage] = useState('');
    const [isKiosk, setIsKiosk] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const API_BASE_URL = 'http://localhost:3001';

    useEffect(() => {
        setError('');
        setSuccess('');

        if (editingPolicy) {
            setName(editingPolicy.name);
            setGoogleId(editingPolicy.google_policy_id);
            const rules = editingPolicy.rules || {};
            setCameraDisabled(rules.cameraDisabled || false);
            setScreenCaptureDisabled(rules.screenCaptureDisabled !== false);
            if (rules.kioskCustomLauncherEnabled) {
                setIsKiosk(true);
                setApplications(rules.applications || []);
            } else {
                setIsKiosk(false);
                setApplications([]);
            }
        } else {
            setName('');
            setGoogleId('');
            setCameraDisabled(false);
            setScreenCaptureDisabled(true);
            setIsKiosk(false);
            setApplications([]);
        }
    }, [editingPolicy]);

    const handleAddApp = () => {
        if (newAppPackage && !applications.some(app => app.packageName === newAppPackage)) {
            const newApp = { packageName: newAppPackage, installType: "FORCE_INSTALLED" };
            setApplications([...applications, newApp]);
            setNewAppPackage('');
        }
    };

    const handleRemoveApp = (packageNameToRemove) => {
        setApplications(applications.filter(app => app.packageName !== packageNameToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        let response;
        try {
            if (editingPolicy) {
                const newRules = {
                    ...editingPolicy.rules,
                    cameraDisabled,
                    screenCaptureDisabled,
                    applications: isKiosk ? applications : editingPolicy.rules?.applications
                };
                response = await fetch(`${API_BASE_URL}/api/policies/${editingPolicy.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rules: newRules }),
                });
            } else {
                const rules = { cameraDisabled, screenCaptureDisabled };
                response = await fetch(`${API_BASE_URL}/api/policies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tenantId, name, google_policy_id: googleId, rules }),
                });
            }
            const data = await response.json();
            if (response.ok) {
                setSuccess(editingPolicy ? `¡Política actualizada!` : `¡Política creada!`);
                onFormSubmit();
                if (!editingPolicy) { // Clear form if creating new
                    setName(''); setGoogleId('');
                }
            } else { setError(data.error || 'Ocurrió un error.'); }
        } catch (e) {
            setError('Error de conexión.');
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6 border-t-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                {editingPolicy ? `Editando: ${editingPolicy.name}` : 'Crear Nueva Política'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <input
                        type="text"
                        placeholder="Nombre de la Política"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        readOnly={!!editingPolicy}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="ID de Política (Google)"
                        value={googleId}
                        onChange={e => setGoogleId(e.target.value)}
                        readOnly={!!editingPolicy}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="camera"
                        checked={cameraDisabled}
                        onChange={e => setCameraDisabled(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="camera" className="text-sm text-gray-700">Deshabilitar Cámara</label>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="screen"
                        checked={screenCaptureDisabled}
                        onChange={e => setScreenCaptureDisabled(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="screen" className="text-sm text-gray-700">Deshabilitar Captura de Pantalla</label>
                </div>

                {isKiosk && (
                    <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium text-gray-700 mb-2">Modo Quiosco</h4>
                        <ul className="mb-2 space-y-1">
                            {applications.map(app => (
                                <li key={app.packageName} className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded text-sm">
                                    <span>{app.packageName}</span>
                                    <button type="button" onClick={() => handleRemoveApp(app.packageName)} className="text-red-500 hover:text-red-700 text-xs font-bold">Quitar</button>
                                </li>
                            ))}
                        </ul>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="com.ejemplo.app"
                                value={newAppPackage}
                                onChange={e => setNewAppPackage(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={handleAddApp}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm"
                            >
                                Añadir
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                    {editingPolicy && (
                        <button
                            type="button"
                            onClick={clearEditing}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                    >
                        {editingPolicy ? 'Guardar Cambios' : 'Crear Política'}
                    </button>
                </div>
            </form>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            {success && <p className="mt-3 text-sm text-green-600">{success}</p>}
        </div>
    );
}