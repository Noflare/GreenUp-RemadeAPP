"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

const CsvPage = () => {
    const [csvData, setCsvData] = useState([]);
    const [status, setStatus] = useState([])

    useEffect(() => {
        axios.post('/api/Download?side=right&type=chargeSession')
            .then(response => {
                // Parse CSV data using Papaparse
                /* Data fromat :
                "Prêt à charger

                Charge immédiate

                Données électriques

                Courant de charge max :

                32A

                Courant du câble max :

                0A

                Courant de consigne :

                0A

                Courant de charge Inst. :

                0.00A
                Puissance instantanée :

                0.00kVA"*/
                const parsedData = Papa.parse(response.data, {
                    header: true,
                    delimiter: ';',
                    skipEmptyLines: true,
                }).data;

                setCsvData(parsedData);
            })
            .catch(error => {
                console.error('Error fetching CSV data:', error);
            });

        axios.get('/api/Update_state.jsp?side=right&type=TableauDeBord')
            .then(response => {
                // Traitement de la réponse ici
                /* data format :
                "Date et heure de dÃ©but de la session;Temps total en min;Temps sans charge en min;Temps de charge en min;Energie en Wh;Date et heure de fin de la session;Type de fiche;Id (si RFID activÃ©);nom (si RFID activÃ©)
09/02/2024 15:50;13;1;12;1429,41;09/02/2024 16:01;T2S;NoActive;
                 */
                const parsedData = Papa.parse(response.data, {
                    header: true,
                    delimiter: ';',
                    skipEmptyLines: true,
                }).data;

                setStatus(parsedData)
            })
            .catch(error => {
                // Gestion des erreurs ici
                console.error(error);
            });
    }, []);

    return (
        <div>
            <h1>CSV Page</h1>
            {csvData.length > 0 ? (
                <div>
                    {/* Display the CSV content in a table */}
                    <table>
                        <thead>
                        <tr>
                            {/* Use CSV headers as columns */}
                            {Object.keys(csvData[0]).map((header, index) => (
                                <th key={index}>{header}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {csvData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {Object.values(row).map((value, colIndex) => (
                                    <td key={colIndex}>{value}</td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>Loading data...</p>
            )}
        </div>
    );
};

export default CsvPage;
