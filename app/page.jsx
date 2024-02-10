"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import styles from './page.module.css'

const CsvPage = () => {
    const [csvData, setCsvData] = useState([]);
    const [satus, setSatus] = useState()

    const costPerWh = 0.2516;

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

                let DTArray = [];
                let columnNames = ["Date", "ID", "Type", "Quantity", "Amount", "Timestamp", "Status", "Activity", ""];

                parsedData.forEach((row) => {
                    let rowData = Object.values(row);
                    let rowWithNames = {};

                    // Ajouter des noms depuis l'array pré-défini
                    for (let i = 0; i < rowData.length; i++) {
                        let columnName = columnNames[i];
                        rowWithNames[columnName] = rowData[i];
                    }

                    DTArray.push(rowWithNames);
                });

                console.log(DTArray);

                setCsvData(DTArray);
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

                setSatus(parsedData)
            })
            .catch(error => {
                // Gestion des erreurs ici
                console.error(error);
            });
    }, []);

    const calculateTotalChargeTime = (startDate, timestamp) => {
        const startDateTime = new Date(startDate);
        const timestampDateTime = new Date(timestamp);

        const totalMilliseconds = timestampDateTime - startDateTime;
        const totalMinutes = Math.floor(totalMilliseconds / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return {
            hours: hours,
            minutes: minutes
        };
    };

    const formatTotalChargeTime = (startDate, timestamp) => {
        const totalChargeTime = calculateTotalChargeTime(startDate, timestamp);

        if (totalChargeTime.hours === 0) {
            return `${totalChargeTime.minutes} min.`;
        } else {
            return `${totalChargeTime.hours}h${totalChargeTime.minutes} min.`;
        }
    };


    const calculateTotalCost = (amount, quantity, costPerKWh) => {
        const totalKWh = (parseFloat(amount.replace(',', '.'))) / 1000;
        const totalCost = totalKWh * costPerKWh;
        return totalCost.toFixed(2); // Round to two decimal places for euros
    };

    const formatDisplayDate = (dateString) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const totalChargeTime = csvData.reduce((acc, row) => {
        const chargeTime = calculateTotalChargeTime(row.Date, row.Timestamp);
        acc.hours += chargeTime.hours;
        acc.minutes += chargeTime.minutes;
        return acc;
    }, { hours: 0, minutes: 0 });

    const totalEnergy = csvData.reduce((acc, row) => acc + parseFloat(row.Amount.replace(',', '.')), 0);


    const totalCost = csvData.reduce((acc, row) => {
        const cost = calculateTotalCost(row.Amount, row.Quantity, costPerWh);
        acc += parseFloat(cost);
        return acc;
    }, 0);

    return (
        <div className={styles.main}>
            <div className={styles.borne}>
                <svg viewBox="0 0 665 783" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_1_51)">
                        <g filter="url(#filter0_dd_1_51)">
                            <path d="M0 0H595.933V578.208H0V0Z" fill="#F9F9F9"/>
                        </g>
                        <mask id="mask0_1_51" maskUnits="userSpaceOnUse" x="0" y="0"
                              width="596" height="579">
                            <path d="M0 0H595.933V578.208H0V0Z" fill="white"/>
                        </mask>
                        <g mask="url(#mask0_1_51)">
                            <path d="M588.26 0V578.208H603.606V0H588.26ZM7.67306 578.208V0H-7.67285V578.208H7.67306Z"
                                  fill="#474B4E"/>
                        </g>
                        <g filter="url(#filter1_dd_1_51)">
                            <path d="M0 578.208H595.933V782.883H0V578.208Z" fill="#F9F9F9"/>
                        </g>
                        <mask id="mask1_1_51" maskUnits="userSpaceOnUse" x="0" y="578"
                              width="596" height="205">
                            <path d="M0 578.208H595.933V782.883H0V578.208Z" fill="white"/>
                        </mask>
                        <g mask="url(#mask1_1_51)">
                            <path
                                d="M588.26 578.208V782.883H603.606V578.208H588.26ZM7.67306 782.883V578.208H-7.67285V782.883H7.67306Z"
                                fill="#474B4E"/>
                        </g>
                        <path d="M7.6731 514.247H588.26" stroke="#CECECE" stroke-width="2"/>
                        <path d="M7.6731 762.416H588.26" stroke="#A9A9A9" stroke-width="2"/>
                        <g filter="url(#filter2_i_1_51)">
                            <path
                                d="M396.436 133.039H199.497C191.022 133.039 184.151 139.912 184.151 148.39V388.883C184.151 397.361 191.022 404.234 199.497 404.234H396.436C404.912 404.234 411.782 397.361 411.782 388.883V148.39C411.782 139.912 404.912 133.039 396.436 133.039Z"
                                fill="#414247"/>
                        </g>
                        <g filter="url(#filter3_ii_1_51)">
                            <path d="M634.298 17.9091H595.933V478.428H634.298V17.9091Z" fill="#414247"/>
                        </g>
                        <path
                            d="M634.298 127.922H654.759C660.409 127.922 664.99 132.504 664.99 138.156V153.506H634.298V127.922Z"
                            fill="#363A3C"/>
                        <g filter="url(#filter4_ii_1_51)">
                            <path d="M664.99 153.507H634.298V370.974H664.99V153.507Z" fill="#4C5154"/>
                        </g>
                        <path d="M664.99 370.974H657.317V378.649H664.99V370.974Z" fill="#343739"/>
                        <g filter="url(#filter5_i_1_51)">
                            <path
                                d="M654.759 143.273C657.584 143.273 659.874 140.982 659.874 138.156C659.874 135.33 657.584 133.039 654.759 133.039C651.934 133.039 649.644 135.33 649.644 138.156C649.644 140.982 651.934 143.273 654.759 143.273Z"
                                fill="#C0C0C0"/>
                        </g>
                        <path
                            d="M374.85 293.01V313.26H207.967V224.26H374.85V246.714V250.714H378.85H387.967V289.01H378.85H374.85V293.01Z"
                            stroke="#CDCDCD" stroke-width="8" className={styles.batterieStroke}/>
                        <rect x="321.967" y="237.26" width="41" height="63" fill="#D9D9D9"
                              className={styles.batterie1}/>
                        <rect x="270.967" y="237.26" width="41" height="63" fill="#D9D9D9"
                              className={styles.batterie2}/>
                        <rect x="219.967" y="237.26" width="41" height="63" fill="#D9D9D9"
                              className={styles.batterie3}/>
                    </g>
                    <defs>
                        <filter id="filter0_dd_1_51" x="-28" y="-60" width="651.933" height="706.408"
                                filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                            <feColorMatrix in="SourceAlpha" type="matrix"
                                           values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                            <feOffset dy="42"/>
                            <feGaussianBlur stdDeviation="13.1"/>
                            <feComposite in2="hardAlpha" operator="out"/>
                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_51"/>
                            <feColorMatrix in="SourceAlpha" type="matrix"
                                           values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                            <feOffset dy="-32"/>
                            <feGaussianBlur stdDeviation="14"/>
                            <feComposite in2="hardAlpha" operator="out"/>
                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                            <feBlend mode="normal" in2="effect1_dropShadow_1_51" result="effect2_dropShadow_1_51"/>
                            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_1_51" result="shape"/>
                        </filter>
                        <filter id="filter1_dd_1_51" x="-28" y="520.208" width="651.933" height="323.675"
                                filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                            <feColorMatrix in="SourceAlpha" type="matrix"
                                           values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                            <feOffset dy="33"/>
                            <feGaussianBlur stdDeviation="14"/>
                            <feComposite in2="hardAlpha" operator="out"/>
                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_51"/>
                            <feColorMatrix in="SourceAlpha" type="matrix"
                                           values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                            <feOffset dy="-30"/>
                            <feGaussianBlur stdDeviation="14"/>
                            <feComposite in2="hardAlpha" operator="out"/>
                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                            <feBlend mode="normal" in2="effect1_dropShadow_1_51" result="effect2_dropShadow_1_51"/>
                            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_1_51" result="shape"/>
                        </filter>
                        <filter id="filter2_i_1_51" x="184.151" y="133.039" width="233.631" height="277.195"
                                filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                            <feColorMatrix in="SourceAlpha" type="matrix"
                                           values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                            <feOffset dx="6" dy="6"/>
                            <feGaussianBlur stdDeviation="3.9"/>
                            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_51"/>
                        </filter>
                        <filter id="filter3_ii_1_51" x="595.933" y="11.7091" width="38.3647" height="472.919"
                                filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                            <feColorMatrix in="SourceAlpha" type="matrix"
                                           values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                            <feOffset dy="11"/>
                            <feGaussianBlur stdDeviation="3.1"/>
                            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_51"/>
                            <feColorMatrix in="SourceAlpha" type="matrix"
                                           values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                            <feOffset dy="-8"/>
                            <feGaussianBlur stdDeviation="3.1"/>
                            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                            <feBlend mode="normal" in2="effect1_innerShadow_1_51" result="effect2_innerShadow_1_51"/>
                        </filter>
                        <filter id="filter4_ii_1_51" x="634.298" y="147.307" width="30.6919" height="229.868"
                                filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                            <feColorMatrix in="SourceAlpha" type="matrix"
                                           values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                            <feOffset dy="-8"/>
                            <feGaussianBlur stdDeviation="3.1"/>
                            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_51"/>
                            <feColorMatrix in="SourceAlpha" type="matrix"
                                           values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                            <feOffset dy="11"/>
                            <feGaussianBlur stdDeviation="3.1"/>
                            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                            <feBlend mode="normal" in2="effect1_innerShadow_1_51" result="effect2_innerShadow_1_51"/>
                        </filter>
                        <filter id="filter5_i_1_51" x="649.644" y="133.039" width="10.2307" height="10.2338"
                                filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                            <feColorMatrix in="SourceAlpha" type="matrix"
                                           values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                            <feOffset/>
                            <feGaussianBlur stdDeviation="0.65"/>
                            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_51"/>
                        </filter>
                        <clipPath id="clip0_1_51">
                            <rect width="665" height="783" fill="white"/>
                        </clipPath>
                    </defs>
                </svg>
            </div>
            <div className={styles.stats}>
                <div className={styles.time}>
                    <p>{`${totalChargeTime.hours}h ${totalChargeTime.minutes}min`}</p>
                </div>
                <div className={styles.amount}>
                    <p>{`${totalEnergy} Wh`}</p>
                </div>
                <div className={styles.cost}>
                    <p>{`${totalCost.toFixed(2)} €`}</p>
                </div>
            </div>
            <div className={styles.charges}>
                {csvData.length > 0 ? (
                    csvData.map((row, index) => (
                        <div key={index} className={styles.charge}>
                            <p className={styles.date}>{formatDisplayDate(row.Date)}</p>
                            <div className={styles.data}>
                            <p className={styles.time}>{formatTotalChargeTime(row.Date, row.Timestamp)}</p>
                                <div className={styles.usage}>
                                    <p className={styles.amount}>{row.Amount} Wh
                                        - {calculateTotalCost(row.Amount, row.Quantity, costPerWh)} €</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.loading}>Loading data...</p>
                )}
            </div>
        </div>
    );
};

export default CsvPage;
