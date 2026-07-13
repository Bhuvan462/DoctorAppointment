const crypto = require('crypto');

/**
 * Abstract Payment Service to allow for future Razorpay integration.
 * Currently uses a simulated provider.
 */
class PaymentService {
  constructor(provider = 'simulated') {
    this.provider = provider;
  }

  generateReferenceNumber() {
    return `PAY_${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
  }

  /**
   * Process a payment request
   * @param {Object} data 
   * @param {number} data.amount
   * @param {string} data.method
   * @returns {Promise<Object>} Result of the processing
   */
  async processPayment(data) {
    if (this.provider === 'simulated') {
      return this._simulatePayment(data);
    }
    throw new Error(`Provider ${this.provider} not implemented`);
  }

  async _simulatePayment(data) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (data.method === 'pay_at_hospital') {
      return {
        success: true,
        status: 'pay_at_hospital',
        providerDetails: { simulated: true, method: data.method },
        referenceId: this.generateReferenceNumber(),
      };
    }

    // 10% chance of random failure for simulation, except pay_at_hospital
    const isSuccess = true; // Math.random() > 0.1;

    if (isSuccess) {
      return {
        success: true,
        status: 'successful',
        providerDetails: { simulated: true, method: data.method },
        referenceId: this.generateReferenceNumber(),
      };
    } else {
      return {
        success: false,
        status: 'failed',
        providerDetails: { simulated: true, error: 'Simulated payment failure' },
        referenceId: this.generateReferenceNumber(),
      };
    }
  }
}

module.exports = new PaymentService();
