import {StyleSheet} from 'react-native';

// Страница теста
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 24,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#ecf0f1',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  testCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  testIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  testTime: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  testDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 16,
  },
  testFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testQuestions: {
    fontSize: 14,
    color: '#95a5a6',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    color: '#2ecc71',
    fontWeight: '500',
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2ecc71',
    borderRadius: 3,
  },
  questionCounter: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  questionContainer: {
    maxHeight: 400,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionButtonSelected: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  optionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  optionTextSelected: {
    color: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  prevButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  prevButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#2ecc71',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultModal: {
    alignItems: 'center',
  },
  resultIcon: {
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  resultTestName: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 24,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  scorePercentage: {
    fontSize: 20,
    color: '#2ecc71',
    fontWeight: '600',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  levelLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    marginRight: 8,
  },
  levelValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  lowLevel: {
    color: '#2ecc71',
  },
  moderateLevel: {
    color: '#f39c12',
  },
  highLevel: {
    color: '#e74c3c',
  },
  descriptionContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 15,
    color: '#2c3e50',
    lineHeight: 22,
  },
  recommendationsContainer: {
    alignSelf: 'flex-start',
    width: '100%',
    marginBottom: 24,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 15,
    color: '#2c3e50',
    marginLeft: 8,
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2c3e50',
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  historyDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  historyResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyScore: {
    fontSize: 14,
    color: '#2c3e50',
  },
  historyLevel: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default styles