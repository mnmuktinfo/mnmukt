const CustomerNote = ({ customerNote, setCustomerNote }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">
      Delivery Instructions (Optional)
    </h2>
    <textarea
      placeholder="Add special delivery instructions..."
      value={customerNote}
      onChange={(e) => setCustomerNote(e.target.value)}
      rows={3}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
    />
  </div>
);

export default CustomerNote;
