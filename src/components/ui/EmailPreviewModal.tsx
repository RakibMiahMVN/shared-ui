import Modal from "../ui/Modal";

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailSubject: string;
  emailBody: string;
}

export function EmailPreviewModal({
  isOpen,
  onClose,
  emailSubject,
  emailBody,
}: EmailPreviewModalProps) {
  const bodyContent = `
    <tr>
      <td colspan="2" class="content">
        <h2>Hi Customer,</h2>
        <p>${emailBody}</p>
        <p>
          If you have any questions or need further assistance, please don't hesitate to contact our support team.
        </p>
        <a href="#" class="button">Track your product</a>
      </td>
    </tr>
    <tr>
      <td colspan="2" class="content">
        <table>
          <tr>
            <td class="package">
              <img src="#" alt="Product"/>
            </td>
            <td>
              <h1 class="items-summary">Items summary:</h1>
            </td>
          </tr>
          <tr class="items">
            <td colspan="2">
              <table class="item">
                <tr style="vertical-align: top">
                  <td>
                    <img
                      src="#"
                      alt="Product"
                      style="width: 104px; height: 104px; object-fit: cover; border-radius: 8px; border: 1px solid #e9ecef;"
                    />
                  </td>
                  <td style="padding-left: 16px">
                    <div class="item-title">Product Title</div>
                    <div class="item-description">Product description</div>
                    <div class="item-price">$99.99</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return (
    <Modal open={isOpen} handleClose={onClose}>
      <Modal.Header handleClose={onClose}>
        <h2 className="text-lg font-semibold text-gray-900">Email Preview</h2>
      </Modal.Header>

      <Modal.Content>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <div className="p-3 bg-gray-50 rounded border text-sm">
              {emailSubject}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Body Preview
            </label>
            <div
              className="p-4 bg-white rounded border max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: bodyContent }}
            />
          </div>
        </div>
      </Modal.Content>

      <Modal.Footer>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
