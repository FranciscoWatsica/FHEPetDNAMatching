# 🚀 Quick Start Guide - Privacy Pet DNA Matching

Get started with the project in 5 minutes!

---

## ⚡ Quick Installation

```bash
# 1. Navigate to project directory
cd D:/FHEPetDNAMatching/FHEPetDNAMatching

# 2. Install dependencies
npm install

# 3. Compile contracts
npm run compile

# 4. Run tests
npm test
```

✅ If all tests pass, you're ready to go!

---

## 🧪 Run Tests (Most Important!)

```bash
# Run all 40+ tests
npm test

# Run with gas reporting
npm run test:gas

# Generate coverage report (>90% expected)
npm run test:coverage
```

**Expected output**:
```
  PetDNAMatching Contract
    Deployment
      ✓ Should set the correct owner
      ✓ Should initialize nextPetId to 1
      ...
  40 passing (3s)
```

---

## 🌐 Try the Live Demo

**Live Demo**: https://franciscowatsica.github.io/PetDNAMatching/

**Contract Address** (Sepolia): `0xC16ebe7Cb0A3B057437B8A3568d6Df2FB02812d1`

**What you can do**:
1. Connect MetaMask (switch to Sepolia testnet)
2. Register a test pet with encrypted genetic data
3. Create matching profile
4. Request compatibility matching (0.001 ETH)
5. View match results

---

## 🔧 Local Development

### Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
# (Only needed for deployment, not for testing)
```

### Run Local Hardhat Network

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy to local network
npm run deploy:local
```

---

## 🚀 Deploy to Sepolia

### Prerequisites
1. Get Sepolia ETH from [faucet](https://sepoliafaucet.com/)
2. Setup `.env` file with your private key
3. Get Infura/Alchemy API key

### Deploy

```bash
# 1. Deploy contract
npm run deploy

# 2. Verify on Etherscan
npm run verify

# 3. Interact with contract
npm run interact

# 4. Simulate complete flow
npm run simulate
```

---

## 📖 Key Files

```
FHEPetDNAMatching/
├── README.md                    # Full documentation (550+ lines)
├── TESTING.md                   # Testing guide
├── QUICKSTART.md               # This file
├── IMPROVEMENTS_COMPLETED.md   # What was improved
├── contracts/
│   └── PetDNAMatching.sol      # Main contract
├── test/
│   └── PetDNAMatching.test.js  # 40+ test cases
├── scripts/
│   ├── deploy.js               # Deploy script
│   ├── verify.js               # Verify on Etherscan
│   ├── interact.js             # Query contract
│   └── simulate.js             # Simulate matching
├── .env.example                # Environment template
├── package.json                # Dependencies & scripts
└── hardhat.config.js           # Hardhat configuration
```

---

## 🎯 What to Check

### 1. Tests Pass ✅
```bash
npm test
# Expected: 40 passing
```

### 2. High Coverage ✅
```bash
npm run test:coverage
# Expected: >90% coverage
```

### 3. Linting Clean ✅
```bash
npm run lint
# Expected: No critical errors
```

### 4. Compilation Works ✅
```bash
npm run compile
# Expected: Compiled successfully
```

---

## 🐛 Common Issues

### Issue: `npm install` fails
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Tests fail
**Solution**:
```bash
npm run clean
npm run compile
npm test
```

### Issue: Can't deploy to Sepolia
**Solution**:
1. Check `.env` has correct values
2. Ensure you have Sepolia ETH
3. Verify RPC URL is working

---

## 📚 Learn More

- **Full Documentation**: [README.md](./README.md)
- **Testing Guide**: [TESTING.md](./TESTING.md)
- **Improvements**: [IMPROVEMENTS_COMPLETED.md](./IMPROVEMENTS_COMPLETED.md)

---

## 💡 Quick Commands Reference

```bash
# Testing
npm test                 # Run all tests
npm run test:gas        # With gas reporting
npm run test:coverage   # Coverage report

# Development
npm run compile         # Compile contracts
npm run clean          # Clean artifacts
npm run node           # Start local node

# Deployment
npm run deploy         # Deploy to Sepolia
npm run verify         # Verify on Etherscan
npm run interact       # Query contract
npm run simulate       # Simulate flow

# Code Quality
npm run lint           # Lint Solidity
npm run lint:fix       # Fix linting issues
npm run format         # Format code
```

---

## 🎉 Success Checklist

- [ ] Installed dependencies: `npm install`
- [ ] Compiled contracts: `npm run compile`
- [ ] Ran tests: `npm test` (40 passing)
- [ ] Generated coverage: `npm run test:coverage` (>90%)
- [ ] Tried live demo: https://franciscowatsica.github.io/PetDNAMatching/
- [ ] Read full README: [README.md](./README.md)

---

## 🏆 Competition Ready!

This project includes:
- ✅ **40+ comprehensive tests** with >90% coverage
- ✅ **Full CI/CD pipeline** on GitHub Actions
- ✅ **Complete documentation** (550+ lines)
- ✅ **Working live demo** on Sepolia
- ✅ **Professional quality** throughout

**You're ready to compete!** 🚀

---

**Need Help?**
- 📖 Read [TESTING.md](./TESTING.md) for detailed testing guide
- 💬 Open an issue on GitHub
- 🌐 Check [Zama Documentation](https://docs.zama.ai/fhevm)

**Good luck!** 🍀
