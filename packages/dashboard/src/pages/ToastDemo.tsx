import React from 'react';
import { Button, Flex, Space, Card, Divider, Typography } from 'antd';
import { useToast } from '@es-rottay/designsystem-core';

const { Title, Paragraph, Text } = Typography;

export const ToastDemo: React.FC = () => {
  const toast = useToast();

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Toast System Demo</Title>
      <Paragraph>
        A complete toast notification system with theme-aware styling, auto-dismiss, positions, and actions.
      </Paragraph>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Basic Toasts */}
        <Card title="Basic Toast Types">
          <Flex gap={8} wrap="wrap">
            <Button type="primary" onClick={() => toast.success('Operation successful!')}>
              Success Toast
            </Button>
            <Button danger onClick={() => toast.error('An error occurred!')}>
              Error Toast
            </Button>
            <Button onClick={() => toast.warning('Warning: Check your settings')}>
              Warning Toast
            </Button>
            <Button onClick={() => toast.info('New update available')}>
              Info Toast
            </Button>
            <Button onClick={() => toast.loading('Processing your request...')}>
              Loading Toast
            </Button>
          </Flex>
        </Card>

        {/* With Descriptions */}
        <Card title="Toasts with Descriptions">
          <Flex gap={8} wrap="wrap">
            <Button
              type="primary"
              onClick={() =>
                toast.success('File uploaded successfully', {
                  description: 'Your file "document.pdf" has been uploaded to the server.',
                })
              }
            >
              Success + Description
            </Button>
            <Button
              danger
              onClick={() =>
                toast.error('Upload failed', {
                  description: 'Failed to upload file. Please check your internet connection and try again.',
                })
              }
            >
              Error + Description
            </Button>
            <Button
              onClick={() =>
                toast.warning('Storage almost full', {
                  description: 'You have used 90% of your storage quota. Consider upgrading your plan.',
                })
              }
            >
              Warning + Description
            </Button>
          </Flex>
        </Card>

        {/* With Actions */}
        <Card title="Toasts with Action Buttons">
          <Flex gap={8} wrap="wrap">
            <Button
              onClick={() =>
                toast.info('Message deleted', {
                  description: 'The message has been moved to trash.',
                  action: {
                    label: 'Undo',
                    onClick: () => {
                      toast.success('Message restored!');
                    },
                  },
                })
              }
            >
              Toast with Undo
            </Button>
            <Button
              onClick={() =>
                toast.error('Connection failed', {
                  description: 'Unable to connect to the server.',
                  action: {
                    label: 'Retry',
                    onClick: () => {
                      toast.loading('Reconnecting...');
                      setTimeout(() => {
                        toast.dismissAll();
                        toast.success('Connected successfully!');
                      }, 2000);
                    },
                  },
                })
              }
            >
              Toast with Retry Action
            </Button>
            <Button
              onClick={() =>
                toast.success('Profile updated', {
                  description: 'Your profile changes have been saved.',
                  action: {
                    label: 'View Profile',
                    onClick: () => {
                      toast.info('Opening profile page...');
                    },
                  },
                })
              }
            >
              Toast with View Action
            </Button>
          </Flex>
        </Card>

        {/* Different Durations */}
        <Card title="Custom Durations">
          <Space direction="vertical" size="small" style={{ marginBottom: 12 }}>
            <Text type="secondary">Control how long toasts stay visible</Text>
          </Space>
          <Flex gap={8} wrap="wrap">
            <Button onClick={() => toast.info('Quick message (2s)', { duration: 2000 })}>
              2 Seconds
            </Button>
            <Button onClick={() => toast.info('Normal message (5s)', { duration: 5000 })}>
              5 Seconds (Default)
            </Button>
            <Button onClick={() => toast.info('Long message (10s)', { duration: 10000 })}>
              10 Seconds
            </Button>
            <Button
              onClick={() => {
                const id = toast.loading('Processing... (manual dismiss)', { duration: 0 });
                setTimeout(() => {
                  toast.dismiss(id);
                  toast.success('Processing complete!');
                }, 3000);
              }}
            >
              Manual Dismiss After 3s
            </Button>
          </Flex>
        </Card>

        {/* Different Positions */}
        <Card title="Toast Positions">
          <Space direction="vertical" size="small" style={{ marginBottom: 12 }}>
            <Text type="secondary">Toasts can appear in 6 different positions</Text>
          </Space>
          <Flex gap={8} wrap="wrap">
            <Button onClick={() => toast.info('Top Left Position', { position: 'top-left' })}>
              Top Left
            </Button>
            <Button onClick={() => toast.info('Top Center Position', { position: 'top-center' })}>
              Top Center
            </Button>
            <Button onClick={() => toast.info('Top Right Position', { position: 'top-right' })}>
              Top Right
            </Button>
            <Button onClick={() => toast.info('Bottom Left Position', { position: 'bottom-left' })}>
              Bottom Left
            </Button>
            <Button onClick={() => toast.info('Bottom Center Position', { position: 'bottom-center' })}>
              Bottom Center
            </Button>
            <Button onClick={() => toast.info('Bottom Right Position', { position: 'bottom-right' })}>
              Bottom Right
            </Button>
          </Flex>
        </Card>

        {/* Multiple Toasts */}
        <Card title="Multiple Toasts & Control">
          <Flex gap={8} wrap="wrap">
            <Button
              type="primary"
              onClick={() => {
                toast.success('First toast - Success');
                setTimeout(() => toast.info('Second toast - Info'), 300);
                setTimeout(() => toast.warning('Third toast - Warning'), 600);
                setTimeout(() => toast.error('Fourth toast - Error'), 900);
              }}
            >
              Show 4 Toasts (Stacked)
            </Button>
            <Button
              onClick={() => {
                for (let i = 1; i <= 6; i++) {
                  setTimeout(() => {
                    toast.info(`Toast #${i}`, {
                      description: 'Toasts stack gracefully',
                    });
                  }, i * 200);
                }
              }}
            >
              Show 6 Toasts Sequentially
            </Button>
            <Button danger onClick={() => toast.dismissAll()}>
              Dismiss All Toasts
            </Button>
          </Flex>
        </Card>

        <Divider />

        {/* Real-World Examples */}
        <Card title="Real-World Use Cases">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* File Upload Simulation */}
            <div>
              <Text strong>1. File Upload Simulation</Text>
              <br />
              <Button
                type="primary"
                style={{ marginTop: 8 }}
                onClick={() => {
                  const loadingId = toast.loading('Uploading file...', {
                    description: 'Please wait while we upload your document.',
                    duration: 0,
                  });

                  // Simulate upload
                  setTimeout(() => {
                    toast.dismiss(loadingId);
                    toast.success('Upload complete!', {
                      description: 'Your file "document.pdf" has been successfully uploaded.',
                      duration: 8000,
                      action: {
                        label: 'View File',
                        onClick: () => {
                          toast.info('Opening file viewer...');
                        },
                      },
                    });
                  }, 3000);
                }}
              >
                Simulate File Upload
              </Button>
            </div>

            {/* Form Save Simulation */}
            <div>
              <Text strong>2. Form Save with Validation</Text>
              <br />
              <Button
                style={{ marginTop: 8 }}
                onClick={() => {
                  const loadingId = toast.loading('Saving changes...', { duration: 0 });

                  setTimeout(() => {
                    toast.dismiss(loadingId);

                    // Simulate validation error
                    const hasError = Math.random() > 0.5;

                    if (hasError) {
                      toast.error('Validation failed', {
                        description: 'Please fill in all required fields before saving.',
                        action: {
                          label: 'View Errors',
                          onClick: () => {
                            toast.warning('Highlighting error fields...');
                          },
                        },
                      });
                    } else {
                      toast.success('Changes saved successfully', {
                        description: 'Your profile has been updated.',
                      });
                    }
                  }, 1500);
                }}
              >
                Simulate Form Save (Random Result)
              </Button>
            </div>

            {/* API Request Simulation */}
            <div>
              <Text strong>3. API Request with Retry</Text>
              <br />
              <Button
                style={{ marginTop: 8 }}
                onClick={() => {
                  const loadingId = toast.loading('Fetching data...', { duration: 0 });

                  setTimeout(() => {
                    toast.dismiss(loadingId);
                    toast.error('Network timeout', {
                      description: 'Failed to fetch data from server. Please try again.',
                      action: {
                        label: 'Retry',
                        onClick: () => {
                          const retryId = toast.loading('Retrying...', { duration: 0 });
                          setTimeout(() => {
                            toast.dismiss(retryId);
                            toast.success('Data loaded successfully!');
                          }, 1500);
                        },
                      },
                    });
                  }, 2000);
                }}
              >
                Simulate API Request (Fails)
              </Button>
            </div>

            {/* Deletion with Undo */}
            <div>
              <Text strong>4. Delete with Undo</Text>
              <br />
              <Button
                danger
                style={{ marginTop: 8 }}
                onClick={() => {
                  let undone = false;

                  const toastId = toast.info('Item deleted', {
                    description: 'The item has been moved to trash. You can undo this action.',
                    duration: 10000,
                    action: {
                      label: 'Undo',
                      onClick: () => {
                        undone = true;
                        toast.dismiss(toastId);
                        toast.success('Item restored!', {
                          description: 'The item has been restored to its original location.',
                        });
                      },
                    },
                  });

                  // Simulate permanent deletion after 10 seconds
                  setTimeout(() => {
                    if (!undone) {
                      toast.info('Item permanently deleted', {
                        description: 'The item has been removed from trash.',
                      });
                    }
                  }, 10000);
                }}
              >
                Delete Item (with Undo)
              </Button>
            </div>
          </Space>
        </Card>
      </Space>
    </div>
  );
};
