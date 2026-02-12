import {StyleSheet} from 'react-native';

// Результаты теста
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2c3e50',
    lineHeight: 52,
  },
  scoreMax: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  percentageContainer: {
    alignItems: 'center',
  },
  percentageCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f9fff9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2ecc71',
  },
  percentageValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  descriptionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
  recommendationsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    color: '#2c3e50',
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
    color: '#7f8c8d',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  retestButton: {
    backgroundColor: '#ebf5fb',
  },
  retestButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '500',
  },
  diaryButton: {
    backgroundColor: '#f9fff9',
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  diaryButtonText: {
    color: '#2ecc71',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default styles