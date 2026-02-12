import {StyleSheet} from "react-native";

// Страница для психолога
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
  },
  emergencySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  emergencyCard: {
    backgroundColor: '#fff5f5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffebeb',
  },
  emergencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  emergencyNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 2,
  },
  emergencyDescription: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#2ecc71',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
  },
  tabTextActive: {
    color: 'white',
  },
  chatSection: {
    marginBottom: 24,
  },
  chatPlaceholder: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  chatPlaceholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  chatPlaceholderText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  startChatButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startChatButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#ebf5fb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoCardText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  psychologistsSection: {
    marginBottom: 24,
  },
  psychologistCard: {
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
  psychologistHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  psychologistAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  psychologistAvatarText: {
    fontSize: 30,
  },
  psychologistInfo: {
    flex: 1,
  },
  psychologistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  psychologistSpecialty: {
    fontSize: 14,
    color: '#3498db',
    marginBottom: 6,
  },
  psychologistMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  reviewsText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  experienceText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    height: 24,
  },
  statusAvailable: {
    backgroundColor: '#d4edda',
  },
  statusUnavailable: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2c3e50',
  },
  psychologistEducation: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
    lineHeight: 20,
  },
  psychologistActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  chatButton: {
    backgroundColor: '#ebf5fb',
  },
  chatButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#f9fff9',
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  bookButtonText: {
    color: '#2ecc71',
    fontSize: 16,
    fontWeight: '500',
  },
  consultationInfo: {
    backgroundColor: '#fff9e6',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  consultationInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
    marginBottom: 8,
  },
  consultationInfoText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
});

export default styles