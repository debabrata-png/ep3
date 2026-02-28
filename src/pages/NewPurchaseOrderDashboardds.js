import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './PurchaseOrderDashboardNewds';

export default function NewPurchaseOrderDashboardds() {
    return (
        <AdminLayout title="Purchase Orders">
            <ViewPage />
        </AdminLayout>
    );
}
