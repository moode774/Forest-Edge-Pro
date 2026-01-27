import React from 'react';
import QRCode from 'react-qr-code';

interface QRCodeProps {
    value: string;
    size?: number;
}

export const QRCodeComponent: React.FC<QRCodeProps> = ({ value, size = 64 }) => {
    return (
        <div className="bg-white p-1">
            <QRCode value={value} size={size} />
        </div>
    );
};
